import { Box, Link, Stack, Typography } from '@mui/material'
import splitbee from '@splitbee/web'

export default function BottomBar() {
  return (
    <footer>
      <Box sx={{ width: '100%', marginY: 1 }}>
        <Stack justifyContent="center" alignItems="center">
          <Stack
            spacing={3}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Link
              target="_blank"
              href="https://thomasforbes.com"
              onClick={() => splitbee.track('thomasforbes.com')}
            >
              <Typography variant="h6">More about me...</Typography>
            </Link>
            <Link
              target="_blank"
              href="https://www.buymeacoffee.com/thomasforbes"
              onClick={() => splitbee.track('buymeacoffee.com')}
            >
              <Typography variant="h6">Support me!</Typography>
            </Link>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
            <Link
              href="https://tally.so/r/w76963"
              target="_blank"
              onClick={() => splitbee.track('feedback')}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: '0.7rem', color: 'gray' }}
              >
                Bugs/Features
              </Typography>
            </Link>
            <Typography
              variant="body2"
              sx={{ fontSize: '0.6rem', color: 'gray' }}
            >
              Favicon from{' '}
              <a
                href="https://github.com/twitter/twemoji"
                style={{ color: 'gray' }}
                target="_blank"
                rel="noreferrer"
              >
                twemjoi
              </a>
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </footer>
  )
}
