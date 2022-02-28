import React, { useState } from 'react'
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
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
} from '@mui/material'
// import DarkReader from 'darkreader'
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
          <MenuItem value={v.value}>{v.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

function App() {
  const [lang, setLang]: [string, any] = useState('EV')
  const [exam, setExam]: [string, any] = useState('LC')
  const [level, setLevel]: [string, any] = useState('GL')
  const [year, setYear]: [number, any] = useState(2021)

  let yearList = []
  for (let i = 2021; i >= 1995; i--) {
    yearList.push(i)
  }
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  )

  const createUrl = (markScheme: boolean, paper: number) => {
    let type = 'exampapers'
    if (markScheme) type = ''

    return `https://www.examinations.ie/archive/${type}/${year}/${exam}003${level}P${paper}00${lang}.pdf`
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ marginTop: 5 }}>
        <Stack spacing={4} direction="row">
          {/* EXAM */}
          <SelectChoice
            label="Exam"
            value={exam}
            setter={setExam}
            width={200}
            options={[
              { value: 'LC', label: 'Leaving Cert' },
              { value: 'JC', label: 'Junior Cert' },
              { value: 'LB', label: 'Leaving Cert applied' },
            ]}
          />

          {/* SUBJECT */}
          <Autocomplete
            disablePortal
            options={['test', 'test1']}
            sx={{ width: 250 }}
            renderInput={(params) => <TextField {...params} label="Subject" />}
          />

          {/* YEAR */}
          <Autocomplete
            disablePortal
            options={yearList}
            sx={{ width: 150 }}
            value={year}
            onChange={(e, y) => setYear(y)}
            renderInput={(params) => (
              <TextField {...params} type="number" label="Year" />
            )}
          />
          {/* LEVEL */}
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

          {/* LANGUAGE */}
          <ToggleButtonGroup
            color="primary"
            value={lang}
            exclusive
            onChange={(e: any, s: string) => setLang(s)}
          >
            <ToggleButton value="EV">English</ToggleButton>
            <ToggleButton value="IV">Irish</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {createUrl(false, 1)}
      </Container>
    </ThemeProvider>
  )
}

export default App
