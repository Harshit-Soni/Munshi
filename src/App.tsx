import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthProvider'
import { ThemeProvider } from '@/context/ThemeProvider'
import { FinanceProvider, useFinanceData } from '@/data/FinanceProvider'
import { AppShell } from '@/components/layout/AppShell'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { TransactionPage } from '@/pages/TransactionPage'
import { RecurringPage } from '@/pages/RecurringPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { SettingsPage } from '@/pages/SettingsPage'

function FullScreenMessage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">{children}</div>
}

/** Public login route — bounces authenticated users to the dashboard. */
function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenMessage>Loading…</FullScreenMessage>
  if (user) return <Navigate to="/" replace />
  return <Login />
}

/** Auth gate + app chrome. Renders the sidebar/topbar and nested routes via Outlet. */
function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenMessage>Loading…</FullScreenMessage>
  if (!user) return <Navigate to="/login" replace />
  return (
    <FinanceProvider>
      <AppShell />
    </FinanceProvider>
  )
}

function DataGate() {
  // Nested under FinanceProvider; show a loading state until the first fetch lands.
  const { loading } = useFinanceData()
  if (loading) return <div className="py-16 text-center text-sm text-muted-foreground">Loading your data…</div>
  return <Outlet />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<ProtectedLayout />}>
              <Route element={<DataGate />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/expenses" element={<TransactionPage kind="expense" />} />
                <Route path="/savings" element={<TransactionPage kind="saving" />} />
                <Route path="/recurring" element={<RecurringPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
