import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthProvider'
import type { Category, Income, Kind, Recurring, Transaction } from '@/types/database'
import { todayISO } from '@/lib/utils'

export type NewTransaction = {
  kind: Kind
  category_id: string | null
  description: string
  amount: number
  date: string
}

export type NewRecurring = {
  kind: Kind
  category_id: string | null
  description: string
  amount: number
  start_date: string
  end_date: string | null
}

export function useFinance() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurring, setRecurring] = useState<Recurring[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const [cat, tx, rec, inc] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('recurring_transactions').select('*').order('start_date', { ascending: false }),
      supabase.from('incomes').select('*').order('effective_from', { ascending: false }),
    ])
    setCategories(cat.data ?? [])
    setTransactions(tx.data ?? [])
    setRecurring(rec.data ?? [])
    setIncomes(inc.data ?? [])
    setLoading(false)
  }, [])

  // Current salary: the most recent income whose effective_from is on/before today.
  const currentSalary = useMemo(() => {
    const today = todayISO()
    return incomes.find((i) => i.effective_from <= today)?.amount ?? 0
  }, [incomes])

  useEffect(() => {
    if (user) reload()
  }, [user, reload])

  const addTransaction = useCallback(
    async (t: NewTransaction) => {
      if (!user) return
      await supabase.from('transactions').insert({ ...t, user_id: user.id, source: 'manual' })
      await reload()
    },
    [user, reload],
  )

  const updateTransaction = useCallback(
    async (id: string, patch: Partial<NewTransaction>) => {
      await supabase.from('transactions').update(patch).eq('id', id)
      await reload()
    },
    [reload],
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      await supabase.from('transactions').delete().eq('id', id)
      await reload()
    },
    [reload],
  )

  const addCategory = useCallback(
    async (kind: Kind, name: string, description: string) => {
      if (!user) return
      await supabase.from('categories').insert({ kind, name, description, user_id: user.id })
      await reload()
    },
    [user, reload],
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      await supabase.from('categories').delete().eq('id', id)
      await reload()
    },
    [reload],
  )

  const addRecurring = useCallback(
    async (r: NewRecurring) => {
      if (!user) return
      await supabase.from('recurring_transactions').insert({
        ...r,
        user_id: user.id,
        frequency: 'monthly',
        status: 'active',
        next_run_date: r.start_date,
      })
      await reload()
    },
    [user, reload],
  )

  const stopRecurring = useCallback(
    async (id: string) => {
      await supabase.from('recurring_transactions').update({ status: 'stopped' }).eq('id', id)
      await reload()
    },
    [reload],
  )

  // Set the current salary by inserting a new effective-dated income row.
  const setSalary = useCallback(
    async (amount: number) => {
      if (!user) return
      await supabase.from('incomes').insert({ user_id: user.id, amount, effective_from: todayISO() })
      await reload()
    },
    [user, reload],
  )

  return {
    categories,
    transactions,
    recurring,
    incomes,
    currentSalary,
    loading,
    reload,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    addRecurring,
    stopRecurring,
    setSalary,
  }
}
