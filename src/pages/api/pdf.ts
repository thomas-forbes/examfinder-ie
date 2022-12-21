import muhammara from 'muhammara'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/pdf' })

  const { urls, page } = req.body

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
  streams.forEach((stream) =>
    pdfWriter.createPDFCopyingContext(stream).appendPDFPageFromPDF(page)
  )
  pdfWriter.end()

  res.end()
}
