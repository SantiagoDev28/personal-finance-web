import { AppShell } from './components/templates/AppShell.tsx'
import { useFinance } from './hooks/useFinance.ts'
import { useHash } from './hooks/useHash.ts'
import { MovimientosPage } from './pages/MovimientosPage.tsx'
import { ResumenPage } from './pages/ResumenPage.tsx'

export default function App() {
  const finance = useFinance()
  const hash = useHash()

  return (
    <AppShell>
      {hash === '#movimientos' ? <MovimientosPage {...finance} /> : <ResumenPage {...finance} />}
    </AppShell>
  )
}
