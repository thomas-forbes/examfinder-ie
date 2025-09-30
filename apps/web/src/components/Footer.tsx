import StyledLink from './StyledLink'

export default function Footer() {
  return (
    <>
      <footer className="flex flex-col items-center">
        <div className="flex w-full flex-row flex-wrap items-center justify-center space-x-2 text-center">
          {/* SAMPLE PAPERS */}
          <StyledLink
            name="sample-papers"
            target="_blank"
            href="https://www.examinations.ie/?l=en&mc=ex&sc=sp"
            className="text-lg font-semibold text-orange-400 hover:text-orange-500"
          >
            Sample Papers
          </StyledLink>
          <p>&bull;</p>
          {/* COURSEWORK INFO */}
          <StyledLink
            name="projects-coursework"
            target="_blank"
            href="https://www.examinations.ie/?l=en&mc=ex&sc=he"
            className="text-lg font-semibold text-violet-400 hover:text-violet-500"
          >
            Projects & Coursework
          </StyledLink>
          <p>&bull;</p>
          {/* BUGS */}
          <StyledLink
            name="bugs-features"
            href="https://tally.so/r/w76963"
            target="_blank"
            className="text-lg font-semibold text-red-400 hover:text-red-500"
          >
            Bugs/Features
          </StyledLink>
          <p>&bull;</p>
          <StyledLink
            name="source-code"
            href="https://github.com/thomas-forbes/examfinder"
            target="_blank"
            className="text-lg font-semibold text-slate-100 hover:text-slate-300"
          >
            Source Code
          </StyledLink>
        </div>
      </footer>
    </>
  )
}
