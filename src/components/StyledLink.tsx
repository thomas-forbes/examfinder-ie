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
        'text-slate-400 duration-150 hover:underline',
        className
      )}
    >
      {children}
    </Link>
  )
}
