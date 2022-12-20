import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface props {
  href: string
  target: string
  onClick: () => void
  children: string
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
      className={twMerge('underline text-slate-400 duration-150', className)}
    >
      {children}
    </Link>
  )
}
