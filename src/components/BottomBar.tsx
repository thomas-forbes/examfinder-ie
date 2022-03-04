import { AppBar, Link, Toolbar, Typography } from '@mui/material'

export default function BottomBar() {
  return (
    <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar>
        <Link href="https://forms.gle/geere8U9kzPuWCTH8">
          <Typography variant="body2">Report Bugs</Typography>
        </Link>
      </Toolbar>
    </AppBar>
  )
}
