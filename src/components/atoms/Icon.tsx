import type { ReactNode } from 'react'

export type IconName = 'pulse' | 'list' | 'sun' | 'moon' | 'down' | 'up'

const glyphs: Record<IconName, ReactNode> = {
  pulse: (
    <>
      <path d="M4 16l5-5 3 3 8-8" />
      <path d="M14 6h6v6" />
    </>
  ),
  list: (
    <>
      <path d="M9 7h11M9 12h11M9 17h11" />
      <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3.5v1.5M12 19v1.5M3.5 12H5M19 12h1.5M6 6l1 1M17 17l1 1M18 6l-1 1M7 17l-1 1" />
    </>
  ),
  moon: <path d="M16 13.5A6.5 6.5 0 1 1 10.5 4 5 5 0 0 0 16 13.5z" />,
  down: (
    <>
      <path d="M12 5v14" />
      <path d="M7 14l5 5 5-5" />
    </>
  ),
  up: (
    <>
      <path d="M12 19V5" />
      <path d="M7 10l5-5 5 5" />
    </>
  ),
}

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {glyphs[name]}
    </svg>
  )
}
