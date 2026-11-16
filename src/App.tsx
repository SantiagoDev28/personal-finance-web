import { AppShell } from './components/templates/AppShell.tsx'
import { useFinance } from './hooks/useFinance.ts'
import { ResumenPage } from './pages/ResumenPage.tsx'

export default function App() {
  const finance = useFinance()

  return (
    <AppShell>
      <ResumenPage {...finance} />
    </AppShell>
  )
}
