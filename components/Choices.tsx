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
  Typography,
} from '@mui/material'
import Fuse from 'fuse.js'

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
  const [data, setData] = useState(require(`../public/data/${exam}.json`))

  const [subList, setSubList] = useState([''])
  const [subject, setSubject] = useState(subList[0])

  const [yearList, setYearList] = useState([''])
  const [year, setYear] = useState(yearList[0])

  const [levelList, setLevelList] = useState([])
  const [level, setLevel] = useState('')

  const [langList, setLangList] = useState([])
  const [lang, setLang] = useState('')

  // Updates data
  useEffect(() => {
    setData(require(`../public/data/${exam}`))
  }, [exam])
  // Updates sublist
  useEffect(() => {
    setSubList(Object.keys(data).sort())
  }, [data])
  // Updates subject when exam changes
  useEffect(() => {
    setSubject(subList[0])
  }, [subList])
  // Updates yearList when subject changes
  useEffect(() => {
    if (data[subject]) {
      setYearList(Object.keys(data[subject]).sort().reverse())

      if (data?.[subject]?.[year]) {
        setLangList(data[subject][year].metaData.langList)
        setLevelList(data[subject][year].metaData.levelList)
      }
    }
  }, [subject])
  // Updates year
  useEffect(() => {
    if (!yearList.some((x) => x == year)) setYear(yearList[0])
  }, [yearList])
  // Updates lang/level lists
  useEffect(() => {
    if (data?.[subject]?.[year]) {
      setLangList(data[subject][year].metaData.langList)
      setLevelList(data[subject][year].metaData.levelList)
    }
  }, [year])
  // Updates lang
  useEffect(() => {
    if (data?.[subject]?.[year]) {
      setLang(data[subject][year].metaData.lang)
    }
  }, [langList])
  // Updates level
  useEffect(() => {
    if (data?.[subject]?.[year]) {
      setLevel(data[subject][year].metaData.level)
    }
  }, [levelList])

  // Changes papers
  useEffect(() => {
    if (data?.[subject]?.[year]) {
      setPapers(
        data[subject][year].data.filter((x) =>
          x.url.includes(lang) || x.url.includes('BV')
            ? x.url.includes(level) || x.url.includes('ZL')
            : false
        )
      )
    }
  }, [lang, level, year, subject, exam])

  useEffect(() => {
    console.log(papers)
  }, [papers])

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
