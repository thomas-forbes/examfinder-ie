import { Box, Link, Typography, Stack } from '@mui/material'

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
              href="https://www.buymeacoffee.com/thomasforbes"
              // underline="hover"
            >
              <Typography variant="body2">Support me!</Typography>
            </Link>
            <Link
              href="https://tally.so/r/w76963"
              target="_blank"
              // underline="hover"
            >
              <Typography variant="body2">Bugs/Features</Typography>
            </Link>
          </Stack>
          <Typography
            variant="body2"
            sx={{ fontSize: '0.6rem', color: 'gray', marginTop: 0.5 }}
          >
            Favicon from{' '}
            <a
              href="https://github.com/twitter/twemoji"
              style={{ color: 'gray' }}
            >
              twemjoi
            </a>
          </Typography>
        </Stack>
      </Box>
    </footer>
  )
}
