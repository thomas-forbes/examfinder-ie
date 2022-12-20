import { Container } from '@mui/material'
import splitbee from '@splitbee/web'
import Link from 'next/link'

export default function PaperList({ papers }) {
  const createUrl = (type: string, year: string, url: string) => {
    let typeFormatter = {
      'Exam Paper': 'exampapers',
      'Marking Scheme': 'markingschemes',
    }
    return `https://www.examinations.ie/archive/${typeFormatter[type]}/${year}/${url}`
  }
  return (
    <Container>
      <div className="flex flex-row justify-center flex-wrap gap-8">
        {papers.map((paper, i) => (
          <Link
            key={i}
            href={createUrl(paper.type, paper.year, paper.url)}
            target="_blank"
            style={{ textDecoration: 'none' }}
            rel="noreferrer"
            onClick={() => splitbee.track('Paper', paper)}
          >
            <div className="shadow-xl rounded-lg shadow-slate-900 w-72 bg-zinc-800 overflow-hidden hover:scale-105 duration-150">
              {/* TYPE */}
              <p
                className={`text-2xl font-semibold py-2 px-4 ${
                  paper.type === 'Exam Paper' ? 'bg-blue-500' : 'bg-red-500'
                }`}
              >
                {paper.type}
              </p>
              <div className="px-4 pt-2 pb-3 space-y-1">
                <p className="font-semibold text-2xl">{paper.subject}</p>
                <p className="text-slate-300 text-sm truncate">
                  {paper.details}
                </p>
                <p className="text-slate-300">{paper.year}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
