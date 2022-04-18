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
import data from '../public/data.json'
import consts from '../public/consts.json'
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
  return (
    <Autocomplete
      disablePortal
      options={filteredOps}
      sx={{ width: width }}
      value={value}
      onChange={(e, s) => setter(s ? s : value)}
      autoHighlight={true}
      renderInput={(params) => (
        <TextField
          {...params}
          type={useNumber ? 'number' : 'text'}
          onChange={(e) => {
            let val = e.target.value
            if (val) setFilteredOps(fuse.search(val).map((x) => x.item))
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
    return Array.from(new Set(tempYearList)).sort().reverse()
  }

  const [exam, setExam] = useState('lc')

  const [subList, setSubList]: [string[], any] = useState(updateSubList())
  const [subject, setSubject]: [string, any] = useState(subList[0])

  const [yearList, setYearList]: [string[], any] = useState(updateYearList())
  const [year, setYear] = useState(yearList[0])

  const [levelList, setLevelList] = useState(consts.levelList)
  const [level, setLevel] = useState(levelList[0].value)

  const [langList, setLangList] = useState(consts.langList)
  const [lang, setLang] = useState('EV')

  useEffect(() => {
    let tempSubList = updateSubList()
    setSubList(tempSubList)
    setSubject(tempSubList[0])
  }, [exam])

  useEffect(() => {
    let tempYearList = updateYearList()
    tempYearList.splice(0, 0, 'All')
    setYearList(tempYearList)
    if (!tempYearList.includes(year)) setYear(tempYearList[0])
  }, [subject])

  // Changes papers
  useEffect(() => {
    let examPapers: any = []
    let markingschemes: any = []
    for (const num of data.subNamesToNums[subject]) {
      let tempList = data[exam]?.[num]
      for (const nYear of year === 'All' ? yearList : [year]) {
        let nExamPapers = tempList[nYear]?.exampapers?.map((x) => ({
          ...x,
          type: 'Exam Paper',
          year: nYear,
        }))
        examPapers = examPapers.concat(nExamPapers ? nExamPapers : [])

        let nMarkSchemes = tempList[nYear]?.markingschemes?.map((x) => ({
          ...x,
          type: 'Marking Scheme',
          year: nYear,
        }))
        markingschemes = markingschemes.concat(nMarkSchemes ? nMarkSchemes : [])
      }
    }
    let finalPapers: any = (examPapers ? examPapers : [])
      .concat(markingschemes ? markingschemes : [])
      .sort((fe, se) => fe.year < se.year)

    // UPDATE AVAILABLE LEVELS
    const nLevelList = levelList.map((x) => ({
      ...x,
      disabled: !finalPapers.some((paper) => paper?.url?.includes(x.value)),
    }))
    setLevelList(nLevelList)
    const nLevel = nLevelList.find((x: any) => !x.disabled)?.value
    if (!nLevelList.some((x) => x.value === level && !x.disabled))
      setLevel(nLevel ? nLevel : '')

    // UPDATE AVAILABLE LANGS
    const nLangList = langList.map((x) => ({
      ...x,
      disabled: !finalPapers.some((paper) => paper?.url?.includes(x.value)),
    }))
    setLangList(nLangList)
    const nLang = nLangList.find((x: any) => !x.disabled)?.value
    if (!nLangList.some((x) => x.value === lang && !x.disabled))
      setLang(nLang ? nLang : '')

    console.log(finalPapers)
    setPapers(
      finalPapers
        .filter(
          (x) =>
            (x.url.includes(lang) || x.url.includes('BV')) &&
            (x.url.includes(level) || x.url.includes('ZL'))
        )
        .map((paper) => ({ ...paper, subject: subject }))
    )
  }, [yearList, year, level, lang])

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
