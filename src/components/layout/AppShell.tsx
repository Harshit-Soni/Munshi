import { useState } from 'react'
import type { ReactNode } from 'react'
import { LayoutGrid, MinusCircle, PlusCircle, Repeat, Tags, Menu, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'

export type View = 'dashboard' | 'expense' | 'saving' | 'recurring' | 'categories'

const NAV: { id: View; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'expense', label: 'Add Expense', icon: MinusCircle },
  { id: 'saving', label: 'Add Saving', icon: PlusCircle },
  { id: 'recurring', label: 'Recurring', icon: Repeat },
  { id: 'categories', label: 'Categories', icon: Tags },
]

export function AppShell({
  view,
  onNavigate,
  onSignOut,
  onThemeChange,
  email,
  children,
}: {
  view: View
  onNavigate: (v: View) => void
  onSignOut: () => void
  onThemeChange?: () => void
  email?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const title = NAV.find((n) => n.id === view)?.label ?? 'Dashboard'

  return (
    <div className="min-h-full">
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-card text-card-foreground transition-transform duration-200 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold leading-none text-primary-foreground">
            M
          </span>
          <span className="text-base font-bold tracking-tight">Munshi</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onNavigate(id)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                view === id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{email ? `Sign out` : 'Sign out'}</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-full flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          <ThemeToggle onChange={onThemeChange} />
        </header>
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-[1100px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
