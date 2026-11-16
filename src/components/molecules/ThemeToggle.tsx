import { Button } from '../atoms/Button.tsx'
import { Icon } from '../atoms/Icon.tsx'
import { useTheme } from '../../hooks/useTheme.ts'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <Button type="button" onClick={toggle} aria-pressed={dark} aria-label={dark ? 'Usar tema claro' : 'Usar tema oscuro'}>
      <Icon name={dark ? 'moon' : 'sun'} />
      <span>{dark ? 'Oscuro' : 'Claro'}</span>
    </Button>
  )
}
