import { useHash } from '../../hooks/useHash.ts'
import { Icon } from '../atoms/Icon.tsx'
import { Button } from '../atoms/Button.tsx'
import { NavItem } from '../molecules/NavItem.tsx'
import type { IconName } from '../atoms/Icon.tsx'

const items: { href: string; label: string; icon: IconName }[] = [
  { href: '#resumen', label: 'Resumen', icon: 'pulse' },
  { href: '#movimientos', label: 'Movimientos', icon: 'list' },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const hash = useHash()

  return (
    <aside className="sidebar" aria-label="Finanzas">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          F
        </span>
        <span className="brand-name">Finanzas</span>
      </div>
      <nav className="nav" id="app-nav" aria-label="Secciones">
        {items.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            current={isCurrent(hash, item.href)}
            collapsed={collapsed}
          >
            {item.label}
          </NavItem>
        ))}
      </nav>
      <div className="sidebar-foot">
        <Button
          type="button"
          aria-expanded={!collapsed}
          aria-controls="app-nav"
          aria-label={collapsed ? 'Expandir menú' : 'Plegar menú'}
          onClick={onToggle}
        >
          <Icon name={collapsed ? 'right' : 'left'} />
        </Button>
      </div>
    </aside>
  )
}

function isCurrent(hash: string, href: string) {
  if (href === '#resumen') return hash === '' || hash === '#resumen'
  return hash === href
}
