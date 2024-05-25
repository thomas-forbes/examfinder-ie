import { Combobox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Fragment, useEffect, useRef, useState } from 'react'

interface props {
  value: string
  onChange: (value: string) => void
  options: string[]
  renderOption?: (option: string) => JSX.Element
}

export default function Autocomplete({
  value,
  onChange,
  options,
  renderOption,
}: props) {
  const [filteredOpts, setFilteredOpts] = useState(options)
  const [query, setQuery] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    setFilteredOpts(
      options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()))
    )
  }, [options, query])

  return (
    <>
      <Combobox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Combobox.Button className="relative h-12 w-full cursor-pointer overflow-hidden rounded-md border border-zinc-200/20 text-left shadow-md sm:text-sm">
            <Combobox.Input
              className="h-full w-full rounded-md border-none bg-zinc-900 py-2 pl-3 pr-10 text-lg font-bold text-white focus:ring-0 focus-visible:outline-none sm:text-base"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={() => value}
              onClick={() => inputRef.current?.select()}
              ref={inputRef}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </Combobox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md border border-zinc-200/20 bg-zinc-900 text-base shadow-lg duration-300 focus:outline-none sm:text-sm">
              {query.trim() && query !== value && filteredOpts.length === 0 && (
                <p className="px-4 py-2 text-zinc-400">No results found</p>
              )}
              {(query.trim() && query !== value ? filteredOpts : options).map(
                (opt, idx) => (
                  <Combobox.Option
                    key={opt + idx}
                    value={opt}
                    className={`relative cursor-pointer select-none px-4 py-2 text-zinc-400 duration-300 hover:bg-zinc-800 data-[focus]:bg-zinc-800 ui-selected:bg-zinc-700 ui-selected:text-white`}
                  >
                    {renderOption ? renderOption(opt) : opt}
                  </Combobox.Option>
                )
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </>
  )
}
