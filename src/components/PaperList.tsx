import splitbee from '@splitbee/web'
import Link from 'next/link'
import { urlPaperType } from '../utils/consts'
import { useEffect } from 'react'

export default function PaperList({ papers }) {
  const createUrl = (type: string, year: string, url: string) => {
    return `https://www.examinations.ie/archive/${urlPaperType[type]}/${year}/${url}`
  }
  useEffect(() => {
    console.log(papers)
  }, [papers])
  return (
    <div className="flex flex-row flex-wrap justify-center gap-8">
      {papers.map((paper, i: number) => (
        <Link
          key={i + paper.year + paper.url}
          href={createUrl(paper.type, paper.year, paper.url)}
          target="_blank"
          style={{ textDecoration: 'none' }}
          rel="noreferrer"
          onClick={() => splitbee.track('Paper', paper)}
          className="paperFade"
        >
          <div className="w-72 overflow-hidden rounded-xl bg-zinc-900 shadow-lg duration-300 hover:scale-105 hover:shadow-2xl">
            {/* TYPE */}
            <p
              className={`px-4 py-2 text-2xl font-semibold ${
                paper.type === 'Exam Paper' ? 'bg-blue-500' : 'bg-red-500'
              }`}
            >
              {paper.type}
            </p>
            <div className="space-y-1 px-4 pb-3 pt-2">
              <p className="text-2xl font-semibold">{paper.subject}</p>
              <p className="truncate text-sm text-zinc-400">{paper.details}</p>
              <p className="font-mono text-zinc-400">{paper.year}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
