import muhammara from 'muhammara'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { z } from 'zod'

export default async function pdf(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') res.status(405).end()
  try {
    const { years, pages, type, code } = z
      .object({
        years: z.array(z.number()),
        pages: z.array(z.number()),
        type: z.string(),
        code: z.string(),
      })
      .parse(JSON.parse(req.body))

    console.log(years, pages, type, code)
    const urls = years.map(
      (y) => `https://www.examinations.ie/archive/${type}/${y}/${code}`
    )

    res.writeHead(200, { 'Content-Type': 'application/pdf' })

    const streams = (
      await Promise.allSettled(
        urls.map(async (url) => {
          const res = await fetch(url)
          if (!res.ok) throw new Error()
          return new muhammara.PDFRStreamForBuffer(
            Buffer.from(await res.arrayBuffer())
          )
        })
      )
    )
      .filter((r) => r.status === 'fulfilled')
      .map(
        (r) =>
          (r as PromiseFulfilledResult<muhammara.PDFRStreamForBuffer>).value
      )

    const pdfWriter = muhammara.createWriter(
      new muhammara.PDFStreamForResponse(res)
    )

    streams.forEach((stream) => {
      const pdfReader = muhammara.createReader(stream)
      const pageCount = pdfReader.getPagesCount()
      const copier = pdfWriter.createPDFCopyingContext(pdfReader as any)
      pages
        .filter((page) => page < pageCount)
        .forEach((page) => copier.appendPDFPageFromPDF(page))
    })

    // const pm = new muhammara.PDFPageModifier(pdfWriter, 0)
    // const ctx = pm.startContext().getContext()
    // ctx.drawRectangle(200, 100, 100, 100, { type: 'fill', color: '0xFFFFFF' })
    // pm.endContext().writePage()

    pdfWriter.end()
    res.end()
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}
