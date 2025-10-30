import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCookie } from 'react-use'
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
  const [exam, setExam] = useState('lc')

  const [favSubsCookie, updateFavSubs] = useCookie('favSubs')
  const [favSubs, setFavSubs] = useState<string[]>([])
  useEffect(() => {
    setFavSubs(favSubsCookie ? JSON.parse(favSubsCookie).sort() : [])
  }, [])

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
              ? x.url.includes(level) ||
                x.url.includes('ZL') ||
                (x.url.includes('CL') && (level == 'AL' || level == 'GL'))
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
    updateLevel(exam, subject, year)
    updateLang(exam, subject, year)
    updatePapers(exam, subject, year, level, lang)
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
          value={exam}
          onValueChange={(s) => {
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
        >
          <SelectTrigger className="h-12 w-52 border-zinc-200/20 bg-zinc-900 text-base font-bold">
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
                {favSubs.includes(subject) && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
                <span className="truncate">{subject}</span>
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

                      const tYearList = Object.keys(data[exam][selected])
                        .sort()
                        .reverse()
                      setYearList(tYearList)
                      const tYear = tYearList.includes(year)
                        ? year
                        : (tYearList[0] as string)
                      setYear(tYear)

                      const level = updateLevel(exam, selected, tYear)
                      const lang = updateLang(exam, selected, tYear)

                      updatePapers(exam, selected, tYear, level, lang)
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
                        subject === sub ? 'opacity-100' : 'opacity-0'
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
            >
              {year}
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

                      const level = updateLevel(exam, subject, selected)
                      const lang = updateLang(exam, subject, selected)

                      updatePapers(exam, subject, selected, level, lang)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        year === y ? 'opacity-100' : 'opacity-0'
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
          value={level}
          onValueChange={(s) => {
            setLevel(s)
            updatePapers(exam, subject, year, s, lang)
          }}
        >
          <SelectTrigger className="h-12 w-44 border-zinc-200/20 bg-zinc-900 text-base font-bold">
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
        <ToggleGroup
          type="single"
          variant="outline"
          size="lg"
          value={lang}
          onValueChange={(value) => {
            if (!value) return // Prevent deselecting
            setLang(value)
            setPrefLang(value)
            updatePrefLangCookie(value, { sameSite: 'strict' })
            updatePapers(exam, subject, year, level, value)
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
