import React, { useEffect, useState } from 'react'
import {
  TextField,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Container,
  Box,
  Stack,
  AppBar,
  Grid,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
  Typography,
  paperClasses,
} from '@mui/material'
// import DarkReader from 'darkreader'
import data from './data.json'
import './App.css'

const SelectChoice = ({
  label,
  value,
  setter,
  options,
  width,
}: {
  label: string
  value: string
  setter: any
  options: any
  width: number
}) => {
  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e: any) => setter(e.target.value)}
        sx={{ width: width }}
      >
        {options.map((v: any) => (
          <MenuItem value={v.value} key={v.value}>
            {v.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

const AutocompleteChoice = ({
  options,
  value,
  setter,
  label,
  useNumber,
  width,
}: {
  options: string[]
  value: string
  setter: any
  label: string
  useNumber?: boolean
  width: number
}) => {
  return (
    <Autocomplete
      disablePortal
      options={options}
      sx={{ width: width }}
      value={value}
      onChange={(e, s) => setter(s)}
      renderInput={(params) => (
        <TextField
          {...params}
          type={useNumber ? 'number' : 'text'}
          label={label}
        />
      )}
    />
  )
}

function App() {
  const subNamesToNums = Object.keys(data.subNumsToNames).reduce((ret, key) => {
    ret[data.subNumsToNames[key]] = key
    return ret
  }, {})

  const [exam, setExam] = useState('lc')

  const [subList, setSubList] = useState(
    Object.keys(data[exam])
      .map((x) => data.subNumsToNames[x])
      .sort()
  )
  const [subject, setSubject] = useState(subList[0])

  const [yearList, setYearList] = useState([])
  const [year, setYear] = useState(yearList[0])

  const [level, setLevel] = useState('AL')
  const [lang, setLang] = useState('EV')

  useEffect(() => {
    let tempSubList = Object.keys(data[exam])
      .map((x) => data.subNumsToNames[x])
      .sort()
    setSubList(tempSubList)
    setSubject(tempSubList[0])
  }, [exam])

  const prefersDarkMode = true // useMediaQuery('(prefers-color-scheme: dark)') // no light mode for u

  const theme = React.useMemo(
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
      {/* CHOICES */}
      <Container sx={{ marginTop: 5 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* EXAM */}
          <Grid item>
            <SelectChoice
              label="Exam"
              value={exam}
              setter={setExam}
              width={200}
              options={[
                { value: 'lc', label: 'Leaving Cert' },
                { value: 'jc', label: 'Junior Cert' },
                { value: 'lb', label: 'Leaving Cert applied' },
              ]}
            />
          </Grid>

          {/* SUBJECT */}
          <Grid item>
            <AutocompleteChoice
              options={subList}
              width={250}
              label="Subject"
              value={subject}
              setter={setSubject}
            />
          </Grid>

          {/* YEAR */}
          <Grid item>
            <AutocompleteChoice
              options={yearList}
              width={150}
              value={year}
              setter={setYear}
              label="Year"
              useNumber
            />
          </Grid>

          {/* LEVEL */}
          <Grid item>
            <SelectChoice
              label="Level"
              value={level}
              setter={setLevel}
              width={200}
              options={[
                { value: 'AL', label: 'Higher Level' },
                { value: 'GL', label: 'Ordinary Level' },
                { value: 'BL', label: 'Foundational Level' },
              ]}
            />
          </Grid>

          {/* LANGUAGE */}
          <Grid item>
            <ToggleButtonGroup
              color="primary"
              value={lang}
              exclusive
              onChange={(e: any, s: string) => setLang(s)}
            >
              <ToggleButton value="EV">English</ToggleButton>
              <ToggleButton value="IV">Irish</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Container>
      {/* PAPERS */}
      <Container sx={{ marginTop: 3 }}>
        <Grid container justifyContent="center">
          <Grid item>
            {/* {papers.map()} */}
            <Paper elevation={3} sx={{ width: 225 }}>
              <Box
                sx={{
                  background: '#2196f3',
                  paddingX: 2,
                  paddingY: 1,
                  borderRadius: 1,
                }}
              >
                <Container disableGutters>
                  <Typography variant="h4">Exam Paper</Typography>
                </Container>
              </Box>
              <Box sx={{ paddingX: 2, paddingY: 1 }}>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Grid item>
                    <Typography variant="h6">Maths</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1">Paper 1</Typography>
                  </Grid>
                </Grid>
                <Typography variant="body1">2021</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  )
}

export default App
