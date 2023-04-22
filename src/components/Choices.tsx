import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Autocomplete as MuiAutocomplete,
  Select as MuiSelect,
  Rating,
  Stack,
  TextField,
} from '@mui/material'
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'
import splitbee from '@splitbee/web'
import Fuse from 'fuse.js'
import { useEffect, useState } from 'react'
import { useCookie } from 'react-use'
import data from '../../public/data.json'
import Autocomplete from './Autocomplete'
import Select from './Select'
import Slicing from './Slicing'
import { StarIcon } from '@heroicons/react/24/solid'

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
      <MuiSelect
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
      </MuiSelect>
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
    <MuiAutocomplete
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
              // onClick={() => {}}
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
            const val = e.target.value
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
  const exams = [
    { value: 'lc', label: 'Leaving Cert' },
    { value: 'jc', label: 'Junior Cert' },
    { value: 'lb', label: 'Leaving Cert Applied' },
  ]
  const [exam, setExam] = useState('lc')

  const [favSubsCookie, updateFavSubs] = useCookie('favSubs')
  const [favSubs, setFavSubs]: [string[], any] = useState(
    favSubsCookie ? JSON.parse(favSubsCookie).sort() : []
  )

  const [subList, setSubList] = useState(Object.keys(data[exam]).sort())
  const [subject, setSubject] = useState<string>(
    (favSubs.length > 0 ? favSubs[0] : subList[0]) as string
  )

  const [yearList, setYearList] = useState(
    Object.keys(data[exam][subject]).sort().reverse()
  )
  const [year, setYear] = useState<string>(yearList[0] as string)

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
        .filter(
          (x) =>
            x.url.includes(lang) || x.url.includes('BV')
              ? x.url.includes(level) || x.url.includes('ZL')
              : false
          // sort Exam Papers then Marking Schemes
        )
        .sort((a, b) =>
          a.type == 'Exam Paper' && b.type == 'Marking Scheme' ? -1 : 1
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

    const tLevel =
      tLevelList.find((x) => x.value == level && !x.disabled)?.value ||
      tLevelList.find((x) => !x.disabled)?.value ||
      ''
    setLevel(tLevel)
    return tLevel
  }
  const updateLang = (exam: string, subject: string, year: string) => {
    const tLangList = langList.map((x) => ({
      ...x,
      disabled: !data[exam][subject][year].some((paper: any) =>
        paper?.url?.includes(x.value)
      ),
    }))
    setLangList(tLangList)

    const availLangs = tLangList.filter((x) => !x.disabled)
    let lang = ''
    if (availLangs.some((x) => x.value == prefLang && !x.disabled))
      lang = prefLang
    else lang = availLangs[0]?.value || ''
    setLang(lang)
    return lang
  }

  useEffect(() => {
    updateLevel(exam, subject, year)
    updateLang(exam, subject, year)
    updatePapers(exam, subject, year, level, lang)
  }, [])
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* CHOICES */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-8">
        {/* EXAM */}
        <div className="w-52">
          <Select
            value={exam}
            onChange={(s) => {
              console.log(s)
              setExam(s)
              const tSubList = Object.keys(data[s]).sort()
              setSubList(tSubList)
              const tSubject = tSubList.includes(subject)
                ? subject
                : (tSubList[0] as string)
              setSubject(tSubject)

              const tYearList = Object.keys(data[s][tSubject]).sort().reverse()
              setYearList(tYearList)
              const tYear = tYearList.includes(year)
                ? year
                : (tYearList[0] as string)
              setYear(tYear)

              const level = updateLevel(s, tSubject, tYear)
              const lang = updateLang(s, tSubject, tYear)

              updatePapers(s, tSubject, tYear, level, lang)
            }}
            options={exams}
            title={exams.find((e) => e.value == exam)!.label}
          />
        </div>

        {/* SUBJECT */}
        <div className="w-64">
          <Autocomplete
            value={subject}
            onChange={(s) => {
              setSubject(s)
              const tYearList = Object.keys(data[exam][s]).sort().reverse()
              setYearList(tYearList)
              const tYear = tYearList.includes(year)
                ? year
                : (tYearList[0] as string)
              setYear(tYear)

              const level = updateLevel(exam, s, tYear)
              const lang = updateLang(exam, s, tYear)

              updatePapers(exam, s, tYear, level, lang)
            }}
            options={subList.sort((a, b) => {
              if (favSubs.includes(a) && !favSubs.includes(b)) return -1
              if (!favSubs.includes(a) && favSubs.includes(b)) return 1
              return 0
            })}
            renderOption={(option) => (
              <div className="flex flex-row items-center gap-2">
                <div className="h-4 w-4">
                  <button
                    className="z-10 text-lg duration-300 hover:scale-110"
                    onClick={() => {
                      let tFavSubs = favSubs
                      if (favSubs.includes(option)) {
                        tFavSubs = favSubs.filter((x) => x != option)
                      } else {
                        tFavSubs = [...favSubs, option]
                      }
                      setFavSubs(tFavSubs)
                      updateFavSubs(JSON.stringify(tFavSubs), {
                        expires: new Date(
                          Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
                        ),
                        sameSite: 'strict',
                      })
                    }}
                  >
                    {favSubs.includes(option) ? (
                      <StarIcon className="h-full w-full text-yellow-400" />
                    ) : (
                      <StarIconOutline className="h-full w-full text-gray-400" />
                    )}
                  </button>
                </div>
                <div>{option}</div>
              </div>
            )}
          />
        </div>

        {/* YEAR */}
        <div className="w-32">
          <Autocomplete
            value={year}
            onChange={(s) => {
              setYear(s)

              const level = updateLevel(exam, subject, s)
              const lang = updateLang(exam, subject, s)

              updatePapers(exam, subject, s, level, lang)
            }}
            options={yearList}
          />
        </div>

        {/* LEVEL */}
        <div className="w-44">
          <Select
            value={level}
            onChange={(s) => {
              setLevel(s)

              updatePapers(exam, subject, year, s, lang)
            }}
            options={levelList}
            title={levelList.find((e) => e.value == level)!.label}
          />
        </div>

        {/* LANGUAGE */}
        <div className="flex h-12 flex-row items-stretch divide-x divide-zinc-200/20 overflow-hidden rounded-md border border-zinc-200/20 ">
          {langList.map((l) => (
            <button
              className={`px-4 py-3 text-center font-bold duration-300 disabled:bg-zinc-900 disabled:opacity-50 ${
                l.value == lang ? 'bg-zinc-800' : 'bg-zinc-900'
              }`}
              onClick={() => {
                setLang(l.value)
                setPrefLang(l.value)
                updatePrefLangCookie(l.value, { sameSite: 'strict' })

                updatePapers(exam, subject, year, level, l.value)
              }}
              disabled={l?.disabled}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      {/* SLICING */}
      <Slicing
        yearList={yearList.map((y) => parseInt(y))}
        subject={subject}
        types={papers
          .filter((p) => p.url.includes('.pdf'))
          .map((p) => ({
            type: p.type,
            code: p.url,
            details: p.details,
          }))}
      />
    </div>
  )
}
