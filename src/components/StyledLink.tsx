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
        'text-slate-400 decoration-2 underline-offset-2 duration-300 hover:underline hover:underline-offset-4',
        className
      )}
    >
      {children}
    </Link>
  )
}
