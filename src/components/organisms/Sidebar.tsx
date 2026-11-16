import { useHash } from '../../hooks/useHash.ts'
import { NavItem } from '../molecules/NavItem.tsx'
import type { IconName } from '../atoms/Icon.tsx'

const items: { href: string; label: string; icon: IconName }[] = [
  { href: '#resumen', label: 'Resumen', icon: 'pulse' },
  { href: '#movimientos', label: 'Movimientos', icon: 'list' },
]

export function Sidebar() {
  const hash = useHash()

  return (
    <aside className="sidebar">
      <div className="brand">Finanzas</div>
      <nav className="nav" aria-label="Secciones">
        {items.map((item) => (
          <NavItem key={item.href} href={item.href} icon={item.icon} current={isCurrent(hash, item.href)}>
            {item.label}
          </NavItem>
        ))}
      </nav>
    </aside>
  )
}

function isCurrent(hash: string, href: string) {
  if (href === '#resumen') return hash === '' || hash === '#resumen'
  return hash === href
}
