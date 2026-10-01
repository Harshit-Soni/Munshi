import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '@/context/AuthProvider'
import { applySavedTheme } from '@/lib/theme'
import { useFinance } from '@/data/useFinance'
import { AppShell, type View } from '@/components/layout/AppShell'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { TransactionPage } from '@/pages/TransactionPage'
import { RecurringPage } from '@/pages/RecurringPage'
import { CategoriesPage } from '@/pages/CategoriesPage'

function Shell() {
  const { user, loading, signOut } = useAuth()
  const [view, setView] = useState<View>('dashboard')
  const [themeTick, setThemeTick] = useState(0)
  const finance = useFinance()

  if (loading) {
    return <div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
  }
  if (!user) return <Login />

  return (
    <AppShell
      view={view}
      onNavigate={setView}
      onSignOut={signOut}
      onThemeChange={() => setThemeTick((t) => t + 1)}
      email={user.email ?? undefined}
    >
      <div key={themeTick}>
        {finance.loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading your data…</div>
        ) : view === 'dashboard' ? (
          <Dashboard finance={finance} />
        ) : view === 'expense' ? (
          <TransactionPage kind="expense" finance={finance} />
        ) : view === 'saving' ? (
          <TransactionPage kind="saving" finance={finance} />
        ) : view === 'recurring' ? (
          <RecurringPage finance={finance} />
        ) : (
          <CategoriesPage finance={finance} />
        )}
      </div>
    </AppShell>
  )
}

export default function App() {
  useEffect(() => {
    applySavedTheme()
  }, [])
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
