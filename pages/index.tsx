import { useState } from 'react'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Stack,
} from '@mui/material'
import Head from 'next/head'

import BottomBar from '../components/BottomBar'
import Choices from '../components/Choices'
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
      <Head>
        <title>Exam Finder</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Head>
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
