import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface props {
  href: string
  children: string
  target?: string
  onClick?: () => void
  className?: string
}

export default function StyledLink({
  href,
  target,
  onClick,
  children,
  className,
}: props) {
  return (
    <Link
      href={href}
      target={target}
      onClick={onClick}
      className={twMerge(
        'text-slate-400 decoration-1 underline-offset-1 duration-200 hover:underline hover:underline-offset-2',
        className
      )}
    >
      {children}
    </Link>
  )
}
