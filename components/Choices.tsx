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
  group = false,
  setFavSubs,
}: {
  options: { label: string; group: string }[]
  value: { label: string; group: string }
  setter: any
  label: string
  useNumber?: boolean
  width: number
  group?: boolean
  setFavSubs?: any
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
        setter(s ? s.label : value.label)
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
                        setFavSubs((prev: string[]) => [...prev, option.label])
                        setter(option.label)
                        splitbee.track('favourite', { subject: option.label })
                      } else {
                        setFavSubs((prev: string[]) =>
                          prev.filter((v) => v != option.label)
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
            return options.some((x) => x.label === val) ? setter(val) : null
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

  const [favSubsCookie, updateFavSubs] = useCookie('favSubs')
  const [favSubs, setFavSubs]: [string[], any] = useState(
    favSubsCookie ? JSON.parse(favSubsCookie).sort() : []
  )

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
  const [prefLangCookie, updatePrefLangCookie] = useCookie('prefLang')
  const [prefLang, setPrefLang] = useState(prefLangCookie || '')
  useEffect(() => {
    setPrefLang(prefLangCookie || '')
  }, [prefLangCookie])

  // Update sublist
  useEffect(() => {
    setSubList(Object.keys(data[exam]).sort())
  }, [exam])
  // // Updates subject when exam changes
  // useEffect(() => {
  //   setSubject(subList[0])
  // }, [subList])
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
          year,
          subject,
          level: levelList.find((y) => y.value == level)?.label || 'None',
          lang,
          exam,
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
    setLevel(levelList.find((x) => !x.disabled)?.value || '')
  }, [levelList])
  // Update lang
  useEffect(() => {
    let availLangs = langList.filter((x) => !x.disabled)
    if (availLangs.some((x) => x.value == prefLang && !x.disabled))
      setLang(prefLang)
    else setLang(availLangs[0]?.value || '')
  }, [langList])

  useEffect(() => {
    if (prefLang == '') setPrefLang(lang)
  }, [lang])

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

  useEffect(() => {
    if (favSubs.length > 0) setSubject(favSubs[0])
    else setSubject(subList[0])
  }, [subList])
  useEffect(() => {
    updateFavSubs(JSON.stringify(favSubs))
  }, [favSubs])
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
            setter={setSubject}
            setFavSubs={setFavSubs}
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
            onChange={(e: any, s: string) => {
              if (s !== null) {
                setLang(s)
                // setPrefLang(s)
                updatePrefLangCookie(s)
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
