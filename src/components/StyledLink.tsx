import Link from 'next/link'
import posthog from 'posthog-js'
import { useCallback } from 'react'
import { twMerge } from 'tailwind-merge'

export default function StyledLink({
  name,
  href,
  target,
  onClick,
  children,
  className,
}: {
  name: string
  href: string
  children: string
  target?: string
  onClick?: () => void
  className?: string
}) {
  const handleOnClick = useCallback(() => {
    posthog.capture(name, {
      href,
    })
    onClick?.()
  }, [name, href, onClick])
  return (
    <Link
      href={href}
      target={target}
      onClick={handleOnClick}
      className={twMerge(
        'text-slate-400 decoration-1 underline-offset-1 duration-200 hover:underline hover:underline-offset-2',
        className
      )}
    >
      {children}
    </Link>
  )
}
