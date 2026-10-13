import assert from 'node:assert/strict'
import { Writable } from 'node:stream'
import { afterEach, test } from 'node:test'
import muhammara from '@muhammara/native'
import type { NextApiRequest, NextApiResponse } from 'next'
import pdf from '../src/pages/api/pdf'

const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
})

function createDocument(pageCount: number) {
  const stream = new muhammara.PDFWStreamForBuffer()
  const writer = muhammara.createWriter(stream)
  for (let i = 0; i < pageCount; i++) {
    writer.writePage(writer.createPage(0, 0, 200 + i, 300))
  }
  writer.end()
  assert.ok(stream.buffer)
  return stream.buffer
}

function response() {
  const chunks: Buffer[] = []
  const res = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk))
      callback()
    },
  }) as Writable & {
    statusCode: number
    headers: Record<string, string>
    status(code: number): typeof res
    writeHead(code: number, headers: Record<string, string>): typeof res
  }
  res.statusCode = 200
  res.headers = {}
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.writeHead = (code, headers) => {
    res.statusCode = code
    res.headers = headers
    return res
  }
  return {
    res: res as unknown as NextApiResponse,
    raw: res,
    body: () => Buffer.concat(chunks),
  }
}

test('native PDF endpoint copies requested zero-based pages from each year', async () => {
  const fixture = createDocument(3)
  const urls: string[] = []
  globalThis.fetch = async (input) => {
    urls.push(String(input))
    return new Response(new Uint8Array(fixture), {
      headers: { 'Content-Type': 'application/pdf' },
    })
  }
  const out = response()
  await pdf(
    {
      method: 'POST',
      body: JSON.stringify({
        years: [2025, 2026],
        pages: [0, 2, 99],
        type: 'exampapers',
        code: 'fixture.pdf',
      }),
    } as NextApiRequest,
    out.res
  )
  assert.equal(out.raw.statusCode, 200)
  assert.equal(out.raw.headers['Content-Type'], 'application/pdf')
  assert.deepEqual(urls, [
    'https://www.examinations.ie/archive/exampapers/2025/fixture.pdf',
    'https://www.examinations.ie/archive/exampapers/2026/fixture.pdf',
  ])
  const reader = muhammara.createReader(
    new muhammara.PDFRStreamForBuffer(out.body())
  )
  assert.equal(reader.getPagesCount(), 4)
  assert.deepEqual(
    Array.from({ length: 4 }, (_, i) => reader.parsePage(i).getMediaBox()),
    [
      [0, 0, 200, 300],
      [0, 0, 202, 300],
      [0, 0, 200, 300],
      [0, 0, 202, 300],
    ]
  )
})

test('rejects GET before fetching or starting a PDF response', async () => {
  let calls = 0
  globalThis.fetch = async () => {
    calls++
    throw new Error('unexpected network call')
  }
  const out = response()
  await pdf({ method: 'GET' } as NextApiRequest, out.res)
  assert.equal(out.raw.statusCode, 405)
  assert.equal(calls, 0)
  assert.equal(out.body().length, 0)
})

test('continues when one year is unavailable', async () => {
  const fixture = createDocument(1)
  globalThis.fetch = async (input) =>
    String(input).includes('/2025/')
      ? new Response(null, { status: 404 })
      : new Response(new Uint8Array(fixture))
  const out = response()
  await pdf(
    {
      method: 'POST',
      body: JSON.stringify({
        years: [2025, 2026],
        pages: [0],
        type: 'exampapers',
        code: 'fixture.pdf',
      }),
    } as NextApiRequest,
    out.res
  )
  assert.equal(out.raw.statusCode, 200)
  assert.equal(
    muhammara
      .createReader(new muhammara.PDFRStreamForBuffer(out.body()))
      .getPagesCount(),
    1
  )
})
