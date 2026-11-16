import { Label } from '../atoms/Label.tsx'
import { ThemeToggle } from '../molecules/ThemeToggle.tsx'

export function TopBar() {
  return (
    <header className="topbar">
      <Label>Finanzas personales</Label>
      <ThemeToggle />
    </header>
  )
}
