import { useMemo } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFinanceData } from '@/data/FinanceProvider'
import { formatINR } from '@/lib/utils'

export function RecurringPage() {
  const { recurring, categories, stopRecurring } = useFinanceData()
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Recurring Transactions</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Kind', 'Category', 'Description', 'Amount', 'Start', 'End', 'Status', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground ${
                      h === 'Amount' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recurring.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No recurring transactions set up yet.
                  </td>
                </tr>
              )}
              {recurring.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3">{r.kind === 'expense' ? 'Expense' : 'Saving'}</td>
                  <td className="px-5 py-3">{r.category_id ? catName.get(r.category_id) ?? '—' : '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.description}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatINR(r.amount)}</td>
                  <td className="px-5 py-3">{r.start_date}</td>
                  <td className="px-5 py-3">{r.end_date ?? 'No end date — manual stop'}</td>
                  <td className="px-5 py-3">
                    {r.status === 'active' ? <Badge variant="success">Active</Badge> : <Badge variant="muted">Stopped</Badge>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {r.status === 'active' ? (
                      <Button variant="destructive" size="sm" onClick={() => stopRecurring(r.id)}>
                        Stop
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-sm text-muted-foreground">
        This is a setup/management list only — it does not automatically generate monthly entries yet. That will be handled by a
        scheduled job in a later phase.
      </p>
    </div>
  )
}
