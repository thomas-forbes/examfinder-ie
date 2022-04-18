import { useState, useMemo } from 'react'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Stack,
  // useMediaQuery,
} from '@mui/material'
// import DarkReader from 'darkreader'

import BottomBar from '../components/BottomBar'
import Choices from '../components/Choices'
import PaperList from '../components/PaperList'

export default function App() {
  const [papers, setPapers]: [any, any] = useState([])

  const prefersDarkMode = true //useMediaQuery('(prefers-color-scheme: dark)') // no light mode for u
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  )
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack
        direction="column"
        spacing={0}
        justifyContent="flex-start"
        sx={{ minHeight: '100vh' }}
      >
        <Choices papers={papers} setPapers={setPapers} />
        <PaperList papers={papers} />
        <Box sx={{ flexGrow: 1 }}></Box>
        <BottomBar />
      </Stack>
    </ThemeProvider>
  )
}
