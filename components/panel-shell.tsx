'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const PANEL_PATHS = [
  '/panel-admin',
  '/panel-asesor',
  '/panel-broker',
  '/panel-empresa',
  '/panel-fotografo',
  '/panel-propietario',
]

export function PanelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isPanel = PANEL_PATHS.some((path) => pathname.startsWith(path))

  return <main className={isPanel ? 'dashboard-shell' : undefined}>{children}</main>
}
