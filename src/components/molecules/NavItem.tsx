import { Icon, type IconName } from '../atoms/Icon.tsx'

export function NavItem({
  href,
  icon,
  current = false,
  collapsed = false,
  children,
}: {
  href: string
  icon: IconName
  current?: boolean
  collapsed?: boolean
  children: string
}) {
  return (
    <a
      className={current ? 'nav-item nav-item--current' : 'nav-item'}
      href={href}
      aria-current={current ? 'page' : undefined}
      title={collapsed ? children : undefined}
    >
      <Icon name={icon} />
      <span>{children}</span>
    </a>
  )
}
