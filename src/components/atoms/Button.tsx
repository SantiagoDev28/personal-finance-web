import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'ghost'
  children: ReactNode
}

export function Button({ tone = 'ghost', className, children, ...props }: Props) {
  const classes = ['button', tone === 'primary' ? 'button--primary' : '', className].filter(Boolean).join(' ')
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
