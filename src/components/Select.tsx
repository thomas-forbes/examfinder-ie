import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Fragment } from 'react'

interface props {
  value: string
  onChange: (value: string) => void
  title: string
  options: { value: string; label: string; disabled?: boolean }[]
}

export default function Select({ value, onChange, title, options }: props) {
  return (
    <>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Listbox.Button className="relative h-12 w-full cursor-pointer rounded-lg border border-zinc-200/10 bg-zinc-900 py-2 pl-3 pr-10 text-left text-lg text-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-opacity-75 sm:text-base">
            <span className="block truncate font-bold">{title}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md border border-zinc-200/10 bg-zinc-900 text-base shadow-lg duration-300 focus:outline-none sm:text-sm">
              {options.map((opt, idx) => (
                <Listbox.Option
                  key={idx}
                  className={`relative select-none py-2 pl-10 pr-4 duration-300    ${
                    opt.disabled
                      ? 'text-zinc-500 opacity-50'
                      : 'cursor-pointer text-zinc-400 hover:bg-zinc-800 ui-selected:text-white'
                  } ui-selected:bg-zinc-700`}
                  disabled={opt.disabled}
                  value={opt.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {opt.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-200">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </>
  )
}
