import splitbee from '@splitbee/web'
import StyledLink from './StyledLink'

export default function BottomBar() {
  return (
    <>
      <footer className="w-full flex flex-row items-center justify-center space-x-4">
        <StyledLink
          href="https://www.buymeacoffee.com/thomasforbes"
          target="_blank"
          onClick={() => splitbee.track('buymeacoffee.com')}
          className="text-sky-400 text-lg font-semibold"
        >
          Support me!
        </StyledLink>
        <StyledLink
          href="https://tally.so/r/w76963"
          target="_blank"
          onClick={() => splitbee.track('feedback')}
          className="text-red-400 text-lg font-semibold"
        >
          Bugs/Features
        </StyledLink>
      </footer>
    </>
  )
}
