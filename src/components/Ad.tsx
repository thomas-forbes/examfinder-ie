import Image from 'next/image'

// interface AdProps {
//   isMobile?: boolean
// }

export default function Ad() {
  return (
    <>
      <div className="flex flex-col items-center">
        <p className="text-sm font-bold">Another service you may like:</p>
        <div className="m-1 flex w-[205x] gap-x-1 rounded-md bg-zinc-800 p-2">
          <div className="flex flex-col">
            <span className="text-xs">Paper questions by topic</span>
            <span className="text-xs">AI marking scheme tutor</span>
          </div>
          <div className="flex items-end border-l border-white">
            <Image
              src="/logo.png"
              width={30}
              height={30}
              alt="Alt"
              className="mx-[10px]"
            />
            <span className="text-sm">Scrúdú</span>
          </div>
        </div>
      </div>
    </>
  )
}
