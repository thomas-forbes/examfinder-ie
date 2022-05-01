import { useState, useEffect } from 'react'
import {
  Container,
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import Fuse from 'fuse.js'
import data from '../public/data.json'

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
          <MenuItem value={v.value} key={v.value} disabled={v.disabled}>
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
  const fuse = new Fuse(options)
  const [filteredOps, setFilteredOps] = useState(options)
  useEffect(() => {
    setFilteredOps(options)
  }, [options])
  return (
    <Autocomplete
      disablePortal
      options={filteredOps}
      sx={{ width: width }}
      value={value}
      onChange={(e, s) => {
        setter(s ? s : value)
        setFilteredOps(options)
      }}
      autoHighlight={true}
      renderInput={(params) => (
        <TextField
          {...params}
          type={useNumber ? 'number' : 'text'}
          onChange={(e) => {
            let val = e.target.value
            if (options.includes(val)) setFilteredOps(options)
            else if (val) setFilteredOps(fuse.search(val).map((x) => x.item))
            else setFilteredOps(options)
            return options.some((x) => x === val) ? setter(val) : null
          }}
          label={label}
        />
      )}
    />
  )
}

export default function Choices({ papers, setPapers }) {
  const [exam, setExam] = useState('lc')

  const [subList, setSubList] = useState([''])
  const [subject, setSubject] = useState(subList[0])

  const [yearList, setYearList] = useState([''])
  const [year, setYear] = useState(yearList[0])

  const [allPapers, setAllPapers] = useState([])

  const [levelList, setLevelList] = useState([
    { value: 'AL', label: 'Higher Level', disabled: false },
    { value: 'GL', label: 'Ordinary Level', disabled: false },
    { value: 'BL', label: 'Foundational Level', disabled: false },
    { value: 'CL', label: 'Common Level', disabled: false },
  ])
  const [level, setLevel] = useState('')

  const [langList, setLangList] = useState([
    { value: 'EV', label: 'English', disabled: false },
    { value: 'IV', label: 'Irish', disabled: false },
  ])
  const [lang, setLang] = useState('')

  // Update sublist
  useEffect(() => {
    setSubList(Object.keys(data[exam]).sort())
  }, [exam])
  // Updates subject when exam changes
  useEffect(() => {
    setSubject(subList[0])
  }, [subList])
  // Updates yearList when subject changes
  useEffect(() => {
    if (data?.[exam]?.[subject]) {
      setYearList(Object.keys(data[exam][subject]).sort().reverse())
    }
  }, [subject])
  // Updates year
  useEffect(() => {
    if (!yearList.some((x) => x == year)) setYear(yearList[0])
  }, [yearList])

  // Sets allPapers
  useEffect(() => {
    if (data?.[exam]?.[subject]?.[year])
      setAllPapers(
        data[exam][subject][year].map((x) => ({
          ...x,
          year: year,
          subject: subject,
        }))
      )
  }, [exam, subject, year])

  // Updates level and lang lists
  useEffect(() => {
    if (data?.[exam]?.[subject]?.[year]) {
      setLevelList(
        levelList.map((x) => ({
          ...x,
          disabled: !allPapers.some((paper: any) =>
            paper?.url?.includes(x.value)
          ),
        }))
      )
      setLangList(
        langList.map((x) => ({
          ...x,
          disabled: !allPapers.some((paper: any) =>
            paper?.url?.includes(x.value)
          ),
        }))
      )
    }
  }, [allPapers])
  // Update level
  useEffect(() => {
    let topLevel = levelList.find((x) => !x.disabled)?.value
    setLevel(topLevel ? topLevel : '')
  }, [levelList])
  // Update lang
  useEffect(() => {
    if (!langList.some((x) => x.value == lang && !x.disabled)) {
      let topLang = langList.find((x) => !x.disabled)?.value
      setLang(topLang ? topLang : '')
    }
  }, [langList])

  // Changes papers
  useEffect(() => {
    if (data?.[exam]?.[subject]?.[year]) {
      setPapers(
        allPapers.filter((x: any) =>
          x.url.includes(lang) || x.url.includes('BV')
            ? x.url.includes(level) || x.url.includes('ZL')
            : false
        )
      )
    }
  }, [allPapers, level, lang])

  return (
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
              { value: 'lb', label: 'Leaving Cert Applied' },
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
            options={levelList}
          />
        </Grid>

        {/* LANGUAGE */}
        <Grid item>
          <ToggleButtonGroup
            color="primary"
            value={lang}
            exclusive
            onChange={(e: any, s: string) => (s !== null ? setLang(s) : null)}
          >
            {langList.map((lang) => (
              <ToggleButton
                value={lang.value}
                key={lang.value}
                disabled={lang?.disabled}
              >
                {lang.label}
              </ToggleButton>
            ))}
            {/* <ToggleButton value="EV">English</ToggleButton>
              <ToggleButton value="IV">Irish</ToggleButton> */}
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Container>
  )
}
