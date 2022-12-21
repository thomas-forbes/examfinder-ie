import muhammara from 'muhammara'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { z } from 'zod'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') res.status(405).end()
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

  const streams = await Promise.all(
    urls.map(
      async (url) =>
        new muhammara.PDFRStreamForBuffer(
          Buffer.from(await (await fetch(url)).arrayBuffer())
        )
    )
  )
  const pdfWriter = muhammara.createWriter(
    new muhammara.PDFStreamForResponse(res)
  )
  streams.forEach((stream) => {
    const copier = pdfWriter.createPDFCopyingContext(stream)
    pages.forEach((page) => copier.appendPDFPageFromPDF(page))
  })
  pdfWriter.end()

  res.end()
}
