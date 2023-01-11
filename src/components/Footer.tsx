import splitbee from '@splitbee/web'
import StyledLink from './StyledLink'

export default function Footer() {
  return (
    <>
      <footer className="flex w-full flex-row flex-wrap items-center justify-center space-x-2 text-center">
        {/* SUPPORT */}
        <StyledLink
          href="https://www.buymeacoffee.com/thomasforbes"
          target="_blank"
          onClick={() => splitbee.track('buymeacoffee.com')}
          className="text-lg font-semibold text-sky-400 hover:text-sky-300"
        >
          Support me!
        </StyledLink>
        <p>&bull;</p>
        {/* SAMPLE PAPERS */}
        <StyledLink
          target="_blank"
          onClick={() => splitbee.track('buymeacoffee.com')}
          href="https://www.examinations.ie/?l=en&mc=ex&sc=sp"
          className="text-lg font-semibold text-orange-400 hover:text-orange-300"
        >
          Sample Papers
        </StyledLink>
        <p>&bull;</p>
        {/* BUGS */}
        <StyledLink
          href="https://tally.so/r/w76963"
          target="_blank"
          onClick={() => splitbee.track('feedback')}
          className="text-lg font-semibold text-red-400 hover:text-red-300"
        >
          Bugs/Features
        </StyledLink>
      </footer>
    </>
  )
}
