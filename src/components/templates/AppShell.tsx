import type { ReactNode } from 'react'
import { Sidebar } from '../organisms/Sidebar.tsx'
import { TopBar } from '../organisms/TopBar.tsx'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <TopBar />
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
