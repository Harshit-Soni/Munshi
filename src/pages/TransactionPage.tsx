import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Kind, Transaction } from '@/types/database'
import { useFinanceData } from '@/data/FinanceProvider'
import { formatINR, todayISO } from '@/lib/utils'

export function TransactionPage({ kind }: { kind: Kind }) {
  const { categories, transactions, addTransaction, updateTransaction, deleteTransaction, addRecurring } = useFinanceData()
  const cats = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind])
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])
  const rows = useMemo(() => transactions.filter((t) => t.kind === kind).slice(0, 100), [transactions, kind])

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // recurring
  const [isRecurring, setIsRecurring] = useState(false)
  const [recStart, setRecStart] = useState(todayISO())
  const [recEndMode, setRecEndMode] = useState<'date' | 'manual'>('date')
  const [recEnd, setRecEnd] = useState('')

  const noun = kind === 'expense' ? 'Expense' : 'Saving'
  const plural = kind === 'expense' ? 'Expenses' : 'Savings'

  function reset() {
    setDate(todayISO())
    setCategoryId('')
    setDescription('')
    setAmount('')
    setEditingId(null)
    setIsRecurring(false)
    setRecStart(todayISO())
    setRecEndMode('date')
    setRecEnd('')
  }

  function openForNew() {
    reset()
    setOpen(true)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  function startEdit(t: Transaction) {
    setEditingId(t.id)
    setDate(t.date)
    setCategoryId(t.category_id ?? '')
    setDescription(t.description ?? '')
    setAmount(String(t.amount))
    setIsRecurring(false)
    setOpen(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!categoryId || !amt) return
    if (editingId) {
      await updateTransaction(editingId, { date, category_id: categoryId, description, amount: amt })
    } else {
      await addTransaction({ kind, category_id: categoryId, description, amount: amt, date })
      if (isRecurring) {
        await addRecurring({
          kind,
          category_id: categoryId,
          description,
          amount: amt,
          start_date: recStart || date,
          end_date: recEndMode === 'date' ? recEnd || null : null,
        })
      }
    }
    setOpen(false)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Recent {plural}</h2>
        <Button onClick={openForNew}>
          <Plus className="h-4 w-4" />
          Add {noun}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No entries yet — add your first {noun.toLowerCase()}.
                  </td>
                </tr>
              )}
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3">{t.date}</td>
                  <td className="px-5 py-3">{t.category_id ? catName.get(t.category_id) ?? '—' : '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground">{t.description}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatINR(t.amount)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => startEdit(t)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteTransaction(t.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingId ? `Edit ${noun}` : `Add ${noun}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={categoryId || undefined} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={kind === 'expense' ? 'e.g. Grocery run' : 'e.g. SIP - Index Fund'}
              />
            </div>
            <div>
              <Label htmlFor="amt">Amount (₹)</Label>
              <Input id="amt" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>

            {!editingId && (
              <div className="space-y-4 rounded-md border border-border p-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" className="h-4 w-4 accent-primary" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                  Make this recurring?
                </label>
                {isRecurring && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Frequency</Label>
                      <Input value="Monthly" disabled />
                    </div>
                    <div>
                      <Label htmlFor="recstart">Start date</Label>
                      <Input id="recstart" type="date" value={recStart} onChange={(e) => setRecStart(e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Ends</Label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" className="accent-primary" checked={recEndMode === 'date'} onChange={() => setRecEndMode('date')} />
                          Until a specific date
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" className="accent-primary" checked={recEndMode === 'manual'} onChange={() => setRecEndMode('manual')} />
                          Not sure yet / I'll stop it manually
                        </label>
                      </div>
                    </div>
                    {recEndMode === 'date' && (
                      <div className="sm:col-span-2">
                        <Label htmlFor="recend">End date</Label>
                        <Input id="recend" type="date" value={recEnd} onChange={(e) => setRecEnd(e.target.value)} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? `Update ${noun}` : `Add ${noun}`}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
