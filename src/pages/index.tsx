import splitbee from '@splitbee/web'
import Link from 'next/link'
import { useState } from 'react'

import Choices from '../components/Choices'
import Footer from '../components/Footer'
import PageHead from '../components/PageHead'
import PaperList from '../components/PaperList'
import StyledLink from '../components/StyledLink'

export default function App() {
  const [papers, setPapers] = useState<
    | {
        details: string
        exam: 'lc' | 'jc' | 'lb'
        lang: 'EV' | 'IV' | 'BV'
        level: 'AL' | 'GL' | 'BL' | 'CL' // higher, ordinary, foundational, common
        subject: string
        type: 'Exam Paper' | 'Marking Scheme'
        url: string
        year: string
      }[]
    | []
  >([])
  return (
    <>
      <PageHead />
      {/* MAIN COL */}
      <div className="flex min-h-screen flex-col items-center space-y-6 p-4 pt-6">
        {/* TEXT */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <h1 className="text-6xl font-bold">
            Easily Search Irish Past Papers
          </h1>
          <p className="text-slate-300">
            Built by a{' '}
            <StyledLink
              href="https://thomasforbes.com/"
              target="_blank"
              onClick={() => splitbee.track('thomasforbes.com')}
              className="hover:text-slate-300"
            >
              student
            </StyledLink>{' '}
            for everyone
          </p>
        </div>
        {/* CHOICES */}
        <Choices papers={papers} setPapers={setPapers} />
        {/* FORMULA + TABLES */}
        <div className="flex flex-row flex-wrap justify-center gap-8">
          <Link
            href="https://www.examinations.ie/misc-doc/BI-EX-7266997.pdf"
            target="_blank"
            className="w-72 no-underline"
            rel="noreferrer"
            onClick={() => splitbee.track('Formula and Tables')}
          >
            <div className="rounded-lg bg-orange-500 px-4 py-3 font-semibold shadow-xl shadow-stone-900 duration-300 hover:scale-105">
              <h3 className="text-center text-xl text-white">
                Formula and Tables Book
              </h3>
            </div>
          </Link>
          <Link href="/points" className="w-72 no-underline">
            <div className="rounded-lg bg-violet-500 px-4 py-3 font-semibold shadow-xl shadow-stone-900 duration-300 hover:scale-105">
              <h3 className="text-center text-xl text-white">
                Points Calculator
              </h3>
            </div>
          </Link>
        </div>
        {/* PAPERS */}
        <PaperList papers={papers} />
        {/* DIVIDER */}
        <div className="flex-grow" />
        {/* FOOTER */}
        <Footer />
      </div>
    </>
  )
}
