import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCookie, useLocalStorage } from 'react-use'
import data from '../../public/data.json'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

export default function Choices({ papers, setPapers }) {
  const exams = [
    { value: 'lc', label: 'Leaving Cert' },
    { value: 'jc', label: 'Junior Cert' },
    { value: 'lb', label: 'Leaving Cert Applied' },
  ]

  // Persisted selections with localStorage
  const [exam, setExam] = useLocalStorage('examfinder-exam', 'lc')
  const validExam: string = exam && data[exam] ? exam : 'lc'

  const [favSubsCookie, updateFavSubs] = useCookie('favSubs')
  const [favSubs, setFavSubs] = useState<string[]>([])
  useEffect(() => {
    setFavSubs(favSubsCookie ? JSON.parse(favSubsCookie).sort() : [])
  }, [])

  const initialSubList = Object.keys(data[validExam]).sort()
  const [subList, setSubList] = useState(initialSubList)

  const [subject, setSubject] = useLocalStorage<string>(
    'examfinder-subject',
    initialSubList[0] as string
  )
  const validSubject: string =
    subject && subList.includes(subject) ? subject : subList[0]!

  const initialYearList = Object.keys(data[validExam][validSubject])
    .sort()
    .reverse()
  const [yearList, setYearList] = useState(initialYearList)

  const [year, setYear] = useLocalStorage<string>(
    'examfinder-year',
    initialYearList[0] as string
  )
  const validYear: string =
    year && yearList.includes(year) ? year : yearList[0]!

  const [levelList, setLevelList] = useState([
    { value: 'AL', label: 'Higher Level', disabled: false },
    { value: 'GL', label: 'Ordinary Level', disabled: false },
    { value: 'BL', label: 'Foundational Level', disabled: false },
    { value: 'CL', label: 'Common Level', disabled: false },
  ])
  const [level, setLevel] = useLocalStorage('examfinder-level', 'AL')
  const validLevel: string = level || 'AL'

  const [langList, setLangList] = useState([
    { value: 'EV', label: 'English', disabled: false },
    { value: 'IV', label: 'Irish', disabled: false },
  ])
  const [lang, setLang] = useLocalStorage('examfinder-lang', 'EV')
  const validLang: string = lang || 'EV'
  const [prefLangCookie, updatePrefLangCookie] = useCookie('prefLang')
  const [prefLang, setPrefLang] = useState(prefLangCookie || '')

  const updatePapers = (
    examVal: string,
    subjectVal: string,
    yearVal: string,
    levelVal: string,
    langVal: string
  ) => {
    setPapers(
      data[examVal][subjectVal][yearVal]
        .map((x) => ({
          ...x,
          year: yearVal,
          subject: subjectVal,
          level: levelList.find((y) => y.value == levelVal)?.value || 'None',
          lang: langVal,
          exam: examVal,
        }))
        .filter(
          (x) =>
            x.url.includes(langVal) || x.url.includes('BV')
              ? x.url.includes(levelVal) ||
                x.url.includes('ZL') ||
                (x.url.includes('CL') && (levelVal == 'AL' || levelVal == 'GL'))
              : false
          // sort Exam Papers then Marking Schemes
        )
        .sort((a, b) =>
          a.type == 'Exam Paper' && b.type == 'Marking Scheme' ? -1 : 1
        )
    )
  }

  const updateLevel = (
    examVal: string,
    subjectVal: string,
    yearVal: string
  ) => {
    const tLevelList = levelList.map((x) => ({
      ...x,
      disabled: !data[examVal][subjectVal][yearVal].some((paper: any) =>
        paper?.url?.includes(x.value)
      ),
    }))
    setLevelList(tLevelList)

    const tLevel =
      tLevelList.find((x) => x.value == validLevel && !x.disabled)?.value ||
      tLevelList.find((x) => !x.disabled)?.value ||
      ''
    setLevel(tLevel)
    return tLevel
  }
  const updateLang = (examVal: string, subjectVal: string, yearVal: string) => {
    const tLangList = langList.map((x) => ({
      ...x,
      disabled: !data[examVal][subjectVal][yearVal].some((paper: any) =>
        paper?.url?.includes(x.value)
      ),
    }))
    setLangList(tLangList)

    const availLangs = tLangList.filter((x) => !x.disabled)
    let langVal = ''
    if (availLangs.some((x) => x.value == validLang && !x.disabled))
      langVal = validLang
    else langVal = availLangs[0]?.value || ''
    setLang(langVal)
    return langVal
  }

  const [subjectOpen, setSubjectOpen] = useState(false)
  const [yearOpen, setYearOpen] = useState(false)

  const toggleFavorite = (subjectName: string) => {
    let tFavSubs = favSubs
    if (favSubs.includes(subjectName)) {
      tFavSubs = favSubs.filter((x) => x !== subjectName)
    } else {
      tFavSubs = [...favSubs, subjectName]
    }
    setFavSubs(tFavSubs)
    updateFavSubs(JSON.stringify(tFavSubs), {
      expires: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
      sameSite: 'strict',
    })
  }

  useEffect(() => {
    updateLevel(validExam, validSubject, validYear)
    updateLang(validExam, validSubject, validYear)
    updatePapers(validExam, validSubject, validYear, validLevel, validLang)
  }, [])

  const sortedSubjects = [...subList].sort((a, b) => {
    if (favSubs.includes(a) && !favSubs.includes(b)) return -1
    if (!favSubs.includes(a) && favSubs.includes(b)) return 1
    return a.localeCompare(b)
  })

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* CHOICES */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-4">
        {/* EXAM */}
        <Select
          value={validExam}
          onValueChange={(s) => {
            console.log(s)
            setExam(s)
            const tSubList = Object.keys(data[s]).sort()
            setSubList(tSubList)
            const tSubject = tSubList.includes(validSubject)
              ? validSubject
              : (tSubList[0] as string)
            setSubject(tSubject)

            const tYearList = Object.keys(data[s][tSubject]).sort().reverse()
            setYearList(tYearList)
            const tYear = tYearList.includes(validYear)
              ? validYear
              : (tYearList[0] as string)
            setYear(tYear)

            const newLevel = updateLevel(s, tSubject, tYear)
            const newLang = updateLang(s, tSubject, tYear)

            updatePapers(s, tSubject, tYear, newLevel, newLang)
          }}
        >
          <SelectTrigger
            className="h-12 w-52 border-zinc-200/20 bg-zinc-900 text-base font-bold"
            suppressHydrationWarning
          >
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent className="border-zinc-200/20 bg-zinc-900">
            {exams.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* SUBJECT */}
        <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={subjectOpen}
              className="h-12 w-64 justify-between border-zinc-200/20 bg-zinc-900 text-base font-bold hover:bg-zinc-800"
            >
              <div className="flex items-center gap-2">
                {favSubs.includes(validSubject) && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
                <span className="truncate" suppressHydrationWarning>
                  {validSubject}
                </span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 border-zinc-200/20 bg-zinc-900 p-0">
            <Command className="bg-zinc-900">
              <CommandInput
                placeholder="Search subject..."
                className="h-9 border-zinc-200/20"
              />
              <CommandEmpty>No subject found.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {sortedSubjects.map((sub) => (
                  <CommandItem
                    key={sub}
                    value={sub}
                    onSelect={(currentValue) => {
                      const selected = sortedSubjects.find(
                        (s) => s.toLowerCase() === currentValue.toLowerCase()
                      )
                      if (!selected) return
                      setSubject(selected)
                      setSubjectOpen(false)

                      const tYearList = Object.keys(data[validExam][selected])
                        .sort()
                        .reverse()
                      setYearList(tYearList)
                      const tYear = tYearList.includes(validYear)
                        ? validYear
                        : (tYearList[0] as string)
                      setYear(tYear)

                      const newLevel = updateLevel(validExam, selected, tYear)
                      const newLang = updateLang(validExam, selected, tYear)

                      updatePapers(
                        validExam,
                        selected,
                        tYear,
                        newLevel,
                        newLang
                      )
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(sub)
                        }}
                        className="transition-transform hover:scale-110"
                      >
                        {favSubs.includes(sub) ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <Star className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <span>{sub}</span>
                    </div>
                    <Check
                      className={cn(
                        'ml-2 h-4 w-4',
                        validSubject === sub ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* YEAR */}
        <Popover open={yearOpen} onOpenChange={setYearOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={yearOpen}
              className="h-12 w-32 justify-between border-zinc-200/20 bg-zinc-900 text-base font-bold hover:bg-zinc-800"
              suppressHydrationWarning
            >
              {validYear}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 border-zinc-200/20 bg-zinc-900 p-0">
            <Command className="bg-zinc-900">
              <CommandInput
                placeholder="Search year..."
                className="h-9 border-zinc-200/20"
              />
              <CommandEmpty>No year found.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {yearList.map((y) => (
                  <CommandItem
                    key={y}
                    value={y}
                    onSelect={(currentValue) => {
                      const selected = yearList.find(
                        (yr) => yr.toLowerCase() === currentValue.toLowerCase()
                      )
                      if (!selected) return
                      setYear(selected)
                      setYearOpen(false)

                      const newLevel = updateLevel(
                        validExam,
                        validSubject,
                        selected
                      )
                      const newLang = updateLang(
                        validExam,
                        validSubject,
                        selected
                      )

                      updatePapers(
                        validExam,
                        validSubject,
                        selected,
                        newLevel,
                        newLang
                      )
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        validYear === y ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {y}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* LEVEL */}
        <Select
          value={validLevel}
          onValueChange={(s) => {
            setLevel(s)
            updatePapers(validExam, validSubject, validYear, s, validLang)
          }}
        >
          <SelectTrigger
            className="h-12 w-44 border-zinc-200/20 bg-zinc-900 text-base font-bold"
            suppressHydrationWarning
          >
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent className="border-zinc-200/20 bg-zinc-900">
            {levelList.map((l) => (
              <SelectItem key={l.value} value={l.value} disabled={l.disabled}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* LANGUAGE */}
        <div suppressHydrationWarning>
          <ToggleGroup
            type="single"
            variant="outline"
            size="lg"
            value={validLang}
            onValueChange={(value) => {
              if (!value) return // Prevent deselecting
              setLang(value)
              setPrefLang(value)
              updatePrefLangCookie(value, { sameSite: 'strict' })
              updatePapers(
                validExam,
                validSubject,
                validYear,
                validLevel,
                value
              )
            }}
          >
            {langList.map((l) => (
              <ToggleGroupItem
                key={l.value}
                value={l.value}
                disabled={l?.disabled}
                className="h-12 border-zinc-200/20 bg-zinc-900 px-5 text-base font-bold"
              >
                {l.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      {/* SLICING */}
      {/* <Slicing
        yearList={yearList.map((y) => parseInt(y))}
        subject={subject}
        types={papers
          .filter((p) => p.url.includes('.pdf'))
          .map((p) => ({
            type: p.type,
            code: p.url,
            details: p.details,
          }))}
      /> */}
    </div>
  )
}
