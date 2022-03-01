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
import { reverse } from 'dns'

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
      onChange={(e, s) => setter(s ? s : value)}
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
  const updateSubList = () => {
    return Array.from(
      new Set(
        Object.keys(data[exam])
          .map((x) => data.subNumsToNames[x])
          .sort()
      )
    )
  }
  const updateYearList = () => {
    let tempYearList: string[] = []
    for (const num of data.subNamesToNums[subject]) {
      let tempList = data[exam]?.[num]
      tempYearList = tempYearList.concat(tempList ? Object.keys(tempList) : [])
    }
    tempYearList.sort().reverse()
    return tempYearList
  }
  const createUrl = (type: string, url: string) => {
    let typeFormatter = {
      'Exam Paper': 'exampapers',
      'Marking Scheme': 'markingschemes',
    }
    return `https://www.examinations.ie/archive/${typeFormatter[type]}/${year}/${url}`
  }
  const [exam, setExam] = useState('lc')

  const [subList, setSubList]: [string[], any] = useState(updateSubList())
  const [subject, setSubject]: [string, any] = useState(subList[0])

  const [yearList, setYearList]: [string[], any] = useState(updateYearList())
  const [year, setYear] = useState(yearList[0])

  const [level, setLevel] = useState('AL')
  const [lang, setLang] = useState('EV')

  const [papers, setPapers]: [any, any] = useState([])

  useEffect(() => {
    let tempSubList = updateSubList()
    setSubList(tempSubList)
    setSubject(tempSubList[0])
  }, [exam])

  useEffect(() => {
    let tempYearList = updateYearList()
    setYearList(tempYearList)
    if (!tempYearList.includes(year)) setYear(tempYearList[0])
  }, [subject])

  useEffect(() => {
    console.log(exam, subject, year)
    let place = { exampapers: [{}], markingschemes: [{}] }
    for (const num of data.subNamesToNums[subject]) {
      let tempList = data[exam]?.[num]
      if (tempList && Object.keys(tempList).includes(year))
        place = tempList[year]
    }
    let examPapers = place.exampapers.map((x) => ({ ...x, type: 'Exam Paper' }))
    let markingschemes = place.markingschemes.map((x) => ({
      ...x,
      type: 'Marking Scheme',
    }))
    let finalPapers: any = examPapers.concat(markingschemes)
    setPapers(
      finalPapers.filter((x) => x.url.includes(lang) && x.url.includes(level))
    )
  }, [exam, subject, year, level, lang])

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
              label="Year"
              value={year}
              setter={setYear}
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
        <Grid container spacing={5} justifyContent="center">
          {papers.map((paper, i) => (
            <Grid item key={i}>
              <Paper
                onClick={() => window.open(createUrl(paper.type, paper.url))}
                elevation={3}
                sx={{ width: 300 }}
              >
                <Box
                  sx={{
                    background: '#2196f3',
                    paddingX: 2,
                    paddingY: 1,
                    borderRadius: 1,
                  }}
                >
                  <Container disableGutters>
                    <Typography variant="h4">{paper.type}</Typography>
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
                      <Typography variant="h6">{subject}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1">
                        {paper.details}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body1">{year}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  )
}

export default App
