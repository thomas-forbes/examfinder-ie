import muhammara from 'muhammara'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { z } from 'zod'

export default async (req: NextApiRequest, res: NextApiResponse) => {
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
