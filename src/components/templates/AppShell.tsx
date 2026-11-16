import { useState, type ReactNode } from 'react'
import { Sidebar } from '../organisms/Sidebar.tsx'
import { TopBar } from '../organisms/TopBar.tsx'

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(readCollapsed)

  function toggle() {
    setCollapsed((value) => {
      const next = !value
      try {
        window.localStorage.setItem('sidebar-collapsed', next ? '1' : '0')
      } catch {
        // The menu still folds for this visit when storage is blocked.
      }
      return next
    })
  }

  return (
    <div className={collapsed ? 'shell shell--collapsed' : 'shell'}>
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="shell-main">
        <TopBar />
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

function readCollapsed() {
  try {
    return window.localStorage.getItem('sidebar-collapsed') === '1'
  } catch {
    return false
  }
}
