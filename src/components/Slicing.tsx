import { Listbox } from '@headlessui/react'
import { useState } from 'react'
import { urlPaperType } from '../utils/consts'
import Spinner from './Spinner'

interface props {
  code: string
}

const Question = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-row items-center space-x-2">
    <label className="flex-1 truncate text-slate-300">{label}</label>
    <div className="flex-[2] ">{children}</div>
  </div>
)

export default function Slicing({ code }: props) {
  const [type, setType] = useState('Exam Paper')

  const [startYear, setStartYear] = useState(2022)
  const [endYear, setEndYear] = useState(2022)

  const [startPage, setStartPage] = useState(1)
  const [endPage, setEndPage] = useState(1)

  const [downloadState, setDownloadState] = useState<
    'idle' | 'error' | 'loading'
  >('idle')
  return (
    <details className="w-80 space-y-4 rounded-md bg-zinc-800 py-3 px-4 sm:w-96">
      {/* TITLE */}
      <summary className="cursor-pointer text-center text-2xl font-bold">
        Slice Papers
      </summary>
      {/* TYPE */}
      <Question label="Type">
        <div className="space-y-2 text-center">
          <Listbox value={type} onChange={setType}>
            <Listbox.Button className="w-full rounded-md bg-zinc-600 py-1 px-2">
              {type}
            </Listbox.Button>
            <Listbox.Options className="w-full overflow-hidden rounded-md bg-zinc-700">
              {['Exam Paper', 'Marking Scheme'].map((x, i) => (
                <Listbox.Option
                  key={'label-' + i}
                  value={x}
                  className="cursor-pointer select-none py-1 px-2 hover:bg-zinc-600 ui-selected:bg-zinc-600"
                >
                  {x}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      </Question>
      {[
        { value: startYear, label: 'Start Year', setter: setStartYear },
        { value: endYear, label: 'End Year', setter: setEndYear },
        { value: startPage, label: 'Start Page', setter: setStartPage },
        { value: endPage, label: 'End Page', setter: setEndPage },
      ].map(({ value, label, setter }) => (
        <Question label={label}>
          <input
            type="number"
            className="w-full rounded-md border border-zinc-900/10 bg-white px-2 py-1 shadow-md shadow-zinc-800/5 transition-colors duration-300 placeholder:text-zinc-400 focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-600/10 dark:border-zinc-600 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500"
            value={value}
            min={1}
            onChange={(e) => setter(parseInt(e.target.value))}
          />
        </Question>
      ))}
      {/* DOWNLOAD */}
      <button
        className="flex h-10 w-full items-center justify-center rounded-md bg-sky-500 py-2 px-4 text-lg font-semibold text-sky-100 outline-offset-2 transition active:transition-none enabled:hover:bg-sky-400 enabled:active:bg-sky-500 enabled:active:text-sky-100/80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-600 enabled:dark:hover:bg-sky-500 enabled:dark:active:bg-sky-600 enabled:dark:active:text-sky-100/70"
        disabled={downloadState == 'loading'}
        onClick={async () => {
          setDownloadState('loading')
          const blob = await (
            await fetch('/api/pdf', {
              method: 'POST',
              body: JSON.stringify({
                // all years between first and last year
                years: Array.from(
                  { length: Math.abs(endYear - startYear) + 1 },
                  (_, i) => (startYear < endYear ? startYear + i : endYear + i)
                ),
                pages: Array.from(
                  { length: endPage - 1 - (startPage - 1) + 1 },
                  (_, i) => startPage - 1 + i
                ),
                type: urlPaperType[type],
                code,
              }),
            })
          ).blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          document.body.appendChild(a)
          a.style.display = 'none'
          a.href = url
          // `${subject}-${firstYear}-${lastYear[:2]}`
          a.download = `examfinder.pdf`
          a.click()
          setDownloadState('idle')
        }}
      >
        {downloadState == 'idle' ? (
          'Download'
        ) : downloadState == 'loading' ? (
          <Spinner />
        ) : (
          'Error. Check all fields and try again'
        )}
      </button>
    </details>
  )
}
