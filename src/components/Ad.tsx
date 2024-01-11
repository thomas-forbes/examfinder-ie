import splitbee from '@splitbee/web'
import StyledLink from './StyledLink'
import Link from 'next/link'
import Image from 'next/image'

// interface AdProps {
//   isMobile?: boolean
// }

export default function Ad() {
  return (
    <>
      <div className="flex h-[34px] w-[205x] gap-x-1 m-1">
        <div className="flex flex-col">
          <span className="text-xs">Paper questions by topic</span>
          <span className="text-xs">AI marking scheme tutor</span>
        </div>
        <div className="flex items-end border-l border-white">
          <Image src="/rewise-logo.png" width={30} height={30} alt="Alt" className='mr-[-4px]'/>
          <span className=" text-sm">ewise</span>
        </div>
      </div>
    </>
  )
}
