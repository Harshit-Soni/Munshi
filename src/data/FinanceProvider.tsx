import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useFinance } from './useFinance'

type FinanceValue = ReturnType<typeof useFinance>

const FinanceContext = createContext<FinanceValue | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const finance = useFinance()
  return <FinanceContext.Provider value={finance}>{children}</FinanceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFinanceData() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinanceData must be used within FinanceProvider')
  return ctx
}
