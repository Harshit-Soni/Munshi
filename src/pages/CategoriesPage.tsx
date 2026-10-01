import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Kind } from '@/types/database'
import { useFinance } from '@/data/useFinance'

type Finance = ReturnType<typeof useFinance>

function CategorySection({ kind, finance }: { kind: Kind; finance: Finance }) {
  const { categories, addCategory, deleteCategory } = finance
  const list = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [err, setErr] = useState<string | null>(null)

  async function add() {
    const n = name.trim()
    const d = desc.trim()
    if (!n) return
    if (!d) {
      setErr('Please add a short description to help with future AI auto-categorization.')
      return
    }
    if (list.some((c) => c.name === n)) {
      setErr('That category already exists.')
      return
    }
    setErr(null)
    await addCategory(kind, n, d)
    setName('')
    setDesc('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{kind === 'expense' ? 'Expense' : 'Savings'} Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input className="min-w-[140px] flex-1" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            className="min-w-[220px] flex-[2]"
            placeholder="Short description (helps an AI auto-categorize later)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <Button onClick={add}>Add</Button>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div>
          {list.length === 0 && <p className="py-2 text-sm text-muted-foreground">No categories yet.</p>}
          {list.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
              <div className="min-w-0">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{c.description || 'No description yet.'}</div>
              </div>
              {c.user_id ? (
                <Button variant="destructive" size="sm" onClick={() => deleteCategory(c.id)}>
                  Delete
                </Button>
              ) : (
                <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function CategoriesPage({ finance }: { finance: Finance }) {
  return (
    <div className="space-y-6">
      <CategorySection kind="expense" finance={finance} />
      <CategorySection kind="saving" finance={finance} />
      <p className="text-sm text-muted-foreground">
        Default categories are shared and can't be deleted. Every custom category needs a short description so an AI assistant can
        auto-categorize transactions later. Deleting a category keeps past entries intact.
      </p>
    </div>
  )
}
