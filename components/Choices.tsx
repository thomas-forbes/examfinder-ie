import {
  Autocomplete,
  Box,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import splitbee from '@splitbee/web'
import Fuse from 'fuse.js'
import { useEffect, useState } from 'react'
import { useCookie } from 'react-use'
import data from '../public/data.json'

const SelectChoice = ({
  label,
  value,
  onChange: onChange,
  options,
  width,
}: {
  label: string
  value: string
  onChange: (s: string) => void
  options: any
  width: number
}) => {
  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e: any) => onChange(e.target.value)}
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
  onChange,
  label,
  useNumber,
  width,
  group = false,
  favSubs,
  updateFavSubs,
}: {
  options: { label: string; group: string }[]
  value: { label: string; group: string }
  onChange: (s: string) => void
  label: string
  useNumber?: boolean
  width: number
  group?: boolean
  favSubs?: string[]
  updateFavSubs?: (s: string[]) => void
}) => {
  const fuse = new Fuse(options, { keys: ['label'] })
  const [filteredOps, setFilteredOps] = useState(options)
  useEffect(() => {
    setFilteredOps(options)
  }, [options])
  return (
    <Autocomplete
      disablePortal
      options={filteredOps.sort((a, b) => b.group.localeCompare(a.group))}
      {...(group && { groupBy: (option) => option.group })}
      getOptionLabel={(option) => option.label}
      sx={{ width: width }}
      value={value}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      onChange={(e, s) => {
        onChange(s ? s.label : value.label)
        setFilteredOps(options)
      }}
      {...(group && {
        renderOption: (props, option) => {
          return (
            <li
              {...props}
              onClick={() => {}}
              style={{ width: '100%', padding: 0, paddingRight: 10 }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ width: '100%' }}
              >
                <Box
                  onClick={props.onClick}
                  onTouchStart={props.onTouchStart}
                  data-option-index={props['data-option-index']}
                  component="span"
                  className="MuiAutocomplete-option"
                  sx={{ flexGrow: 1 }}
                >
                  {option.label}
                </Box>
                {group && (
                  <Rating
                    max={1}
                    value={Number(option.group == 'Favourites')}
                    onClick={(e) => {
                      e.preventDefault()
                      if (option.group == 'All') {
                        updateFavSubs &&
                          favSubs &&
                          updateFavSubs([...favSubs, option.label])
                        onChange(option.label)
                        splitbee.track('favourite', { subject: option.label })
                      } else {
                        updateFavSubs &&
                          favSubs &&
                          updateFavSubs(
                            favSubs.filter((x) => x != option.label)
                          )
                      }

                      setFilteredOps(options)
                    }}
                  />
                )}
              </Stack>
            </li>
          )
        },
      })}
      autoHighlight={true}
      renderInput={(params) => (
        <TextField
          {...params}
          type={useNumber ? 'number' : 'text'}
          onChange={(e) => {
            let val = e.target.value
            if (options.map((x) => x.label).includes(val))
              setFilteredOps(options)
            else if (val) {
              setFilteredOps([
                value,
                ...fuse
                  .search(val)
                  .map((x) => x.item)
                  .filter((x) => x.label != value.label),
              ])
            } else setFilteredOps(options)
            return options.some((x) => x.label === val) ? onChange(val) : null
          }}
          label={label}
        />
      )}
    />
  )
}

export default function Choices({ papers, setPapers }) {
  const [exam, setExam] = useState('lc')

  const [favSubsCookie, updateFavSubs] = useCookie('favSubs')
  const [favSubs, setFavSubs]: [string[], any] = useState(
    favSubsCookie ? JSON.parse(favSubsCookie).sort() : []
  )

  const [subList, setSubList] = useState(Object.keys(data[exam]).sort())
  const [subject, setSubject] = useState(
    favSubs.length > 0 ? favSubs[0] : subList[0]
  )

  const [yearList, setYearList] = useState(
    Object.keys(data[exam][subject]).sort().reverse()
  )
  const [year, setYear] = useState(yearList[0])

  const [levelList, setLevelList] = useState([
    { value: 'AL', label: 'Higher Level', disabled: false },
    { value: 'GL', label: 'Ordinary Level', disabled: false },
    { value: 'BL', label: 'Foundational Level', disabled: false },
    { value: 'CL', label: 'Common Level', disabled: false },
  ])
  const [level, setLevel] = useState('AL')

  const [langList, setLangList] = useState([
    { value: 'EV', label: 'English', disabled: false },
    { value: 'IV', label: 'Irish', disabled: false },
  ])
  const [lang, setLang] = useState('EV')
  const [prefLangCookie, updatePrefLangCookie] = useCookie('prefLang')
  const [prefLang, setPrefLang] = useState(prefLangCookie || '')

  const updatePapers = (
    exam: string,
    subject: string,
    year: string,
    level: string,
    lang: string
  ) => {
    setPapers(
      data[exam][subject][year]
        .map((x) => ({
          ...x,
          year,
          subject,
          level: levelList.find((y) => y.value == level)?.value || 'None',
          lang,
          exam,
        }))
        .filter((x) =>
          x.url.includes(lang) || x.url.includes('BV')
            ? x.url.includes(level) || x.url.includes('ZL')
            : false
        )
    )
  }

  const updateLevel = (exam: string, subject: string, year: string) => {
    const tLevelList = levelList.map((x) => ({
      ...x,
      disabled: !data[exam][subject][year].some((paper: any) =>
        paper?.url?.includes(x.value)
      ),
    }))
    setLevelList(tLevelList)

    const level =
      tLevelList.find((x) => x.value == level)?.value ||
      tLevelList.find((x) => !x.disabled)?.value ||
      ''
    setLevel(level)
    return level
  }
  const updateLang = (exam: string, subject: string, year: string) => {
    const tLangList = langList.map((x) => ({
      ...x,
      disabled: !data[exam][subject][year].some((paper: any) =>
        paper?.url?.includes(x.value)
      ),
    }))
    setLangList(tLangList)

    let availLangs = tLangList.filter((x) => !x.disabled)
    let lang = ''
    if (availLangs.some((x) => x.value == prefLang && !x.disabled))
      lang = prefLang
    else lang = availLangs[0]?.value || ''
    setLang(lang)
    return lang
  }
  useEffect(() => {
    updatePapers(exam, subject, year, level, lang)
  }, [])

  return (
    <Container sx={{ marginTop: 5 }}>
      <Grid container spacing={4} justifyContent="center">
        {/* EXAM */}
        <Grid item>
          <SelectChoice
            label="Exam"
            value={exam}
            onChange={(s) => {
              setExam(s)
              let tSubList = Object.keys(data[s]).sort()
              setSubList(tSubList)
              let tSubject = tSubList.includes(subject) ? subject : tSubList[0]
              setSubject(tSubject)

              const level = updateLevel(s, tSubject, year)
              const lang = updateLang(s, tSubject, year)

              updatePapers(s, tSubject, year, level, lang)
            }}
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
            options={subList.map((x) => ({
              label: x,
              group: favSubs.includes(x) ? 'Favourites' : 'All',
            }))}
            width={250}
            label="Subject"
            value={{
              label: subject,
              group: favSubs.includes(subject) ? 'Favourites' : 'All',
            }}
            onChange={(s) => {
              setSubject(s)
              let tYearList = Object.keys(data[exam][s]).sort().reverse()
              setYearList(tYearList)
              let tYear = tYearList.includes(year) ? year : tYearList[0]
              setYear(tYear)

              const level = updateLevel(exam, s, tYear)
              const lang = updateLang(exam, s, tYear)

              updatePapers(exam, s, tYear, level, lang)
            }}
            favSubs={favSubs}
            updateFavSubs={(s) => {
              setFavSubs(s)
              console.log('subs', s)
              updateFavSubs(JSON.stringify(s), {
                expires: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
              })
            }}
            group
          />
        </Grid>

        {/* YEAR */}
        <Grid item>
          <AutocompleteChoice
            options={yearList.map((x) => ({ label: x, group: '' }))}
            width={150}
            label="Year"
            value={{ label: year, group: '' }}
            onChange={(s) => {
              setYear(s)

              const level = updateLevel(exam, subject, s)
              const lang = updateLang(exam, subject, s)

              updatePapers(exam, subject, s, level, lang)
            }}
            useNumber
          />
        </Grid>

        {/* LEVEL */}
        <Grid item>
          <SelectChoice
            label="Level"
            value={level}
            onChange={(s) => {
              setLevel(s)

              updatePapers(exam, subject, year, s, lang)
            }}
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
            onChange={(e: any, s: string) => {
              if (s !== null) {
                setLang(s)
                setPrefLang(s)
                updatePrefLangCookie(s)

                updatePapers(exam, subject, year, level, s)
              }
            }}
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
