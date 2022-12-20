import splitbee from '@splitbee/web'
import StyledLink from './StyledLink'

export default function BottomBar() {
  return (
    <>
      <footer className="w-full flex flex-row items-center justify-center space-x-2">
        <StyledLink
          href="https://www.buymeacoffee.com/thomasforbes"
          target="_blank"
          onClick={() => splitbee.track('buymeacoffee.com')}
          className="text-sky-400 text-lg font-semibold hover:text-sky-300"
        >
          Support me!
        </StyledLink>
        <p>&bull;</p>
        <StyledLink
          href="https://tally.so/r/w76963"
          target="_blank"
          onClick={() => splitbee.track('feedback')}
          className="text-red-400 text-lg font-semibold hover:text-red-300"
        >
          Bugs/Features
        </StyledLink>
      </footer>
    </>
  )
}
