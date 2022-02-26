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
  createTheme,
} from '@mui/material'
import './App.css'

function App() {
  const [lang, setLang]: [string, any] = useState('EV')
  const [exam, setExam]: [string, any] = useState('LC')
  const [level, setLevel]: [string, any] = useState('HL')

  let marks = []
  for (let i = 1995; i <= 2021; i++) {
    marks.push({ value: i, label: i })
  }

  // const theme = createTheme({
  //   components: {
  //     MuiSlider: {
  //       styleOverrides: {
  //         valueLabel: ({ ownerState, theme }) => ({
  //           ...(ownerState.orientation === 'vertical' && {
  //             backgroundColor: 'transparent',
  //             color: theme.palette.grey[500],
  //           }),
  //         }),
  //       },
  //     },
  //   },
  // })
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 30,
        flexDirection: 'column',
      }}
    >
      <div className="flexRow">
        {/* EXAM */}
        <FormControl>
          <InputLabel>Exam</InputLabel>
          <Select
            value={exam}
            label="Exam"
            onChange={(e: any) => setExam(e.target.value)}
          >
            <MenuItem value="LC">Leaving Cert</MenuItem>
            <MenuItem value="JC">Junior Cert</MenuItem>
            <MenuItem value="LCA">Leaving Cert applied</MenuItem>
          </Select>
        </FormControl>

        {/* SUBJECT */}
        <Autocomplete
          disablePortal
          options={['test', 'test1']}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Subject" />}
        />

        {/* YEAR */}
        <Autocomplete
          disablePortal
          options={[1995]}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} type="number" label="Year" />
          )}
        />
        {/* LEVEL */}
        <FormControl>
          <InputLabel>Level</InputLabel>
          <Select
            value={level}
            label="Level"
            onChange={(e: any) => setLevel(e.target.value)}
          >
            <MenuItem value="HL">Higher Level</MenuItem>
            <MenuItem value="OL">Ordinary Level</MenuItem>
            <MenuItem value="FL">Foundational level</MenuItem>
          </Select>
        </FormControl>

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
      </div>
    </div>
  )
}

export default App
