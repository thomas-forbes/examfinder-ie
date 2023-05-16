import splitbee from '@splitbee/web'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHead from '../components/PageHead'
import StyledLink from '../components/StyledLink'
import Footer from '../components/Footer'

interface Subject {
  subject: string
  level: 'H' | 'O'
  grade: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  maths?: boolean
}

const calcPoints = (sub: Subject) => {
  const points = {
    H: [100, 88, 77, 66, 56, 46, 37, 0],
    O: [56, 46, 37, 28, 20, 12, 0, 0],
  }
  return (
    (points[sub.level]?.[sub.grade - 1] ?? 0) +
    (sub.maths && sub.level == 'H' && sub.grade <= 6 ? 25 : 0)
  )
}

export default function Points() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { subject: 'Maths', level: 'H', grade: 1, maths: true },
    { subject: '', level: 'H', grade: 1 },
    { subject: '', level: 'H', grade: 1 },
    { subject: '', level: 'H', grade: 1 },
    { subject: '', level: 'H', grade: 1 },
    { subject: '', level: 'H', grade: 1 },
    { subject: '', level: 'H', grade: 1 },
    { subject: '', level: 'H', grade: 1 },
  ])
  const grades = [1, 2, 3, 4, 5, 6, 7, 8]

  // create array of grade colours
  const colours = [
    'bg-emerald-400', // H1
    'bg-green-500',
    'bg-lime-500',
    'bg-yellow-500',
    'bg-amber-500', // H5, O1
    'bg-orange-500',
    'bg-red-500',
    'bg-rose-500',
    'bg-pink-500',
    'bg-fuchsia-500',
    'bg-purple-500',
    'bg-violet-500', // O8
  ]

  useEffect(() => console.log(subjects), [subjects])
  return (
    <>
      <PageHead title="Examfinder: Leaving Cert Points Calculator" />
      <div className="flex min-h-screen flex-col items-center space-y-6 p-4 pt-6">
        {/* TEXT */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <h1 className="text-6xl font-bold">
            Easily Calculate Leaving Cert Points
          </h1>
          <p className="text-slate-300">
            Built by a{' '}
            <StyledLink
              href="https://thomasforbes.com/"
              target="_blank"
              onClick={() => splitbee.track('thomasforbes.com')}
              className="hover:text-slate-300"
            >
              student
            </StyledLink>{' '}
            for everyone
          </p>
        </div>
        {/* HOME */}
        <Link href="/" className="w-72 no-underline">
          <div className="rounded-lg bg-violet-500 px-4 py-3 font-semibold shadow-xl shadow-stone-900 duration-300 hover:scale-105">
            <h3 className="text-center text-xl text-white">Past Papers</h3>
          </div>
        </Link>
        {/* TABLE */}
        <div className="flex flex-col items-center space-y-4">
          <table className="w-full border-collapse border border-zinc-700">
            <thead>
              <tr className="bg-zinc-900 text-xs sm:text-base">
                {['No.', 'Subject', 'Level', 'Grade', 'Points'].map(
                  (header) => (
                    <th
                      className={`px-3 py-2 ${
                        header == 'No.' ? 'hidde sm:table-cell' : ''
                      }`}
                      key={header}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="overflow-hidden rounded-xl text-base sm:text-base">
              {subjects.map((sub, subIdx) => (
                <tr
                  key={subIdx}
                  className={`odd:bg-zinc-800/70 even:bg-zinc-800 [&>td]:border [&>td]:border-zinc-700 [&>td]:px-2 [&>td]:py-1 [&>td]:xs:px-3 [&>td]:xs:py-2`}
                >
                  {/* NO. */}
                  <td
                    className={`hidde !border-none sm:table-cell ${
                      colours[sub.grade + (sub.level == 'O' ? 3 : -1)]
                    }`}
                  >
                    {subIdx + 1}.
                  </td>
                  {/* NAME */}
                  <td>
                    <input
                      className="w-14 min-w-0 appearance-none rounded-none border-zinc-500 bg-transparent text-xs !text-white outline-none duration-300 placeholder:text-zinc-500 focus:border-blue-500 enabled:border-b-2 xs:text-base sm:w-auto"
                      placeholder="Subject"
                      value={sub.subject}
                      disabled={sub.maths}
                      onChange={(e) =>
                        setSubjects(
                          subjects.map((s, i) =>
                            i === subIdx
                              ? { ...sub, subject: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  </td>
                  {/* LEVEL */}
                  <td className="text-center">
                    <select
                      className="bg-transparent outline-none"
                      value={sub.level}
                      onChange={(e) =>
                        setSubjects(
                          subjects
                            .map((s, i) =>
                              i == subIdx
                                ? { ...sub, level: e.target.value as 'H' | 'O' }
                                : s
                            )
                            .sort((a, b) => calcPoints(b) - calcPoints(a))
                        )
                      }
                    >
                      {['H', 'O'].map((item) => (
                        <option key={item} value={item} className="bg-zinc-700">
                          {item}
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* GRADE */}
                  <td className="text-center">
                    <select
                      className="bg-transparent outline-none"
                      value={sub.grade}
                      onChange={(e) =>
                        setSubjects(
                          subjects
                            .map((s, i) =>
                              i == subIdx
                                ? {
                                    ...sub,
                                    grade: Number(e.target.value) as
                                      | 1
                                      | 2
                                      | 3
                                      | 4
                                      | 5
                                      | 6
                                      | 7
                                      | 8,
                                  }
                                : s
                            )
                            .sort((a, b) => calcPoints(b) - calcPoints(a))
                        )
                      }
                    >
                      {grades.map((value) => (
                        <option
                          value={value}
                          key={value}
                          className="bg-zinc-700"
                        >
                          {sub.level}
                          {value}
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* POINTS */}
                  <td className="text-center">{calcPoints(sub)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="w-72 rounded-lg bg-orange-500 px-4 py-3 text-center text-2xl font-semibold">
            Total:{' '}
            <u>
              {subjects
                .slice(0, 6)
                .reduce((acc, sub) => acc + calcPoints(sub), 0)}
            </u>
          </p>
        </div>
        <div className="flex-grow"></div>
        <Footer />
      </div>
    </>
  )
}
