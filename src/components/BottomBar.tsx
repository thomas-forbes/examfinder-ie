import { AppBar, Link, Toolbar, Typography, Stack } from '@mui/material'

export default function BottomBar() {
  return (
    <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar>
        <Stack spacing={2} direction="row">
          <Typography variant="body2">Built by Thomas Forbes</Typography>
          <Link href="https://forms.gle/geere8U9kzPuWCTH8">
            <Typography variant="body2">Report Bugs</Typography>
          </Link>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
