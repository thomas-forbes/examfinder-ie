import { Combobox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Fragment, useState } from 'react'

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
  const [query, setQuery] = useState(value)
  return (
    <>
      <Combobox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Combobox.Button className="relative h-12 w-full cursor-pointer overflow-hidden rounded-md border border-zinc-200/20 text-left shadow-md sm:text-sm">
            <Combobox.Input
              className="h-full w-full rounded-md border-none bg-zinc-900 py-2 pl-3 pr-10 text-lg font-bold focus:ring-0 focus-visible:outline-none sm:text-base"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={() => value}
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
            <Combobox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-md border border-zinc-200/20 bg-zinc-900 text-base shadow-lg duration-300 focus:outline-none sm:text-sm">
              {(query.trim() && query !== value
                ? options.filter((opt) => {
                    return opt.toLowerCase().includes(query.toLowerCase())
                  })
                : options
              ).map((opt, idx) => (
                <Combobox.Option
                  key={opt + idx}
                  value={opt}
                  className={`relative cursor-pointer select-none py-2 px-4 text-zinc-400 duration-300 hover:bg-zinc-800 ui-selected:bg-zinc-700 ui-selected:text-white`}
                >
                  {renderOption ? renderOption(opt) : opt}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </>
  )
}
