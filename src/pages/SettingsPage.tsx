import { useState } from 'react'
import type { FormEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinanceData } from '@/data/FinanceProvider'
import { formatINR } from '@/lib/utils'

export function SettingsPage() {
  const { currentSalary, setSalary } = useFinanceData()
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const amt = parseFloat(value)
    if (!amt || amt <= 0) return
    setSaving(true)
    await setSalary(amt)
    setSaving(false)
    setSaved(true)
    setValue('')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly income</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-muted/40 p-4">
            <div className="text-sm text-muted-foreground">Current monthly salary</div>
            <div className="mt-1 text-2xl font-bold tracking-tight">
              {currentSalary > 0 ? formatINR(currentSalary) : 'Not set'}
            </div>
          </div>
          <form onSubmit={submit} className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="salary">Set / update salary (₹)</Label>
              <Input
                id="salary"
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 150000"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </form>
          {saved && <p className="text-sm text-success">Salary updated.</p>}
          <p className="text-sm text-muted-foreground">
            Used on the dashboard to show how much of your salary is accounted for each month. Updates take effect from today;
            past months keep their earlier value.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
