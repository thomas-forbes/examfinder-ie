import { createTheme, ThemeProvider } from '@mui/material'
import splitbee from '@splitbee/web'
import Link from 'next/link'
import { useState } from 'react'

import BottomBar from '../components/BottomBar'
import Choices from '../components/Choices'
import PageHead from '../components/PageHead'
import PaperList from '../components/PaperList'
import StyledLink from '../components/StyledLink'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

export default function App() {
  const [papers, setPapers]: [any, any] = useState([])
  return (
    <>
      <PageHead />
      <ThemeProvider theme={theme}>
        {/* MAIN COL */}
        <div className="flex flex-col items-center p-4 pt-6 min-h-screen space-y-6">
          {/* TEXT */}
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="font-bold text-5xl">
              Easily Search Irish Past Papers
            </h1>
            <p className="text-slate-300">
              Built by a{' '}
              <StyledLink
                href="https://thomasforbes.com/"
                target="_blank"
                onClick={() => splitbee.track('thomasforbes.com top')}
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
          <Link
            href="https://www.examinations.ie/misc-doc/BI-EX-7266997.pdf"
            target="_blank"
            className="no-underline"
            rel="noreferrer"
            onClick={() => splitbee.track('Formula and Tables')}
          >
            <div className="bg-orange-500 font-semibold shadow-xl rounded-lg px-4 py-3 shadow-stone-900 hover:scale-105 duration-150">
              <h3 className="text-xl text-white">Formula and Tables Book</h3>
            </div>
          </Link>
          {/* PAPERS */}
          <PaperList papers={papers} />
          {/* DIVIDER */}
          <div className="flex-grow" />
          {/* FOOTER */}
          <BottomBar />
        </div>
      </ThemeProvider>
    </>
  )
}
