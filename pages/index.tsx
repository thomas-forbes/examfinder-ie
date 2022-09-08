import {
  Box,
  createTheme,
  CssBaseline,
  Link,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import splitbee from '@splitbee/web'
import BottomBar from '../components/BottomBar'
import Choices from '../components/Choices'
import PageHead from '../components/PageHead'
import PaperList from '../components/PaperList'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

export default function App() {
  const [papers, setPapers]: [any, any] = useState([])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageHead />
      <Stack
        direction="column"
        spacing={3}
        justifyContent="flex-start"
        alignItems="center"
        pt={2}
        mx={2}
        sx={{ minHeight: '100vh' }}
      >
        <Stack alignItems={'center'}>
          <Typography
            component="h1"
            variant="h3"
            fontWeight="bold"
            textAlign="center"
          >
            Easily Search Irish Past Papers
          </Typography>
          <Typography mt={1} color="#cbd5e0" textAlign="center">
            Built by a{' '}
            <Link
              href="https://thomasforbes.com/"
              color="#cbd5e0"
              target="_blank"
              onClick={() => splitbee.track('thomasforbes.com top')}
            >
              student
            </Link>{' '}
            for everyone
          </Typography>
        </Stack>
        <Choices papers={papers} setPapers={setPapers} />
        <a
          href="https://www.examinations.ie/misc-doc/BI-EX-7266997.pdf"
          target="_blank"
          style={{
            textDecoration: 'none',
            display: 'inline-block',
          }}
          rel="noreferrer"
          onClick={() => splitbee.track('Formula and Tables')}
        >
          <Paper
            elevation={5}
            sx={{
              background: '#f44336',
              paddingX: 2,
              paddingY: 1,
              borderRadius: 1,
            }}
          >
            <Typography variant="h6">Formula and Tables Book</Typography>
          </Paper>
        </a>
        <PaperList papers={papers} />
        <Box sx={{ flexGrow: 1 }}></Box>
        <BottomBar />
      </Stack>
    </ThemeProvider>
  )
}
