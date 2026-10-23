import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, monthLabel, monthSortKey } from '@/lib/utils'

type Mode = 'all' | 'month' | 'custom'

const MODES: { id: Mode; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'month', label: 'Month' },
  { id: 'custom', label: 'Custom' },
]

/** Reusable period filter: returns a control node and a predicate over ISO date strings. */
export function usePeriodFilter(dates: string[]) {
  const [mode, setMode] = useState<Mode>('all')
  const [month, setMonth] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const months = useMemo(() => {
    const s = new Set<string>()
    dates.forEach((d) => s.add(monthLabel(d)))
    return [...s].sort((a, b) => monthSortKey(a) - monthSortKey(b))
  }, [dates])

  const curMonth = month || months[months.length - 1] || ''

  const predicate = (d: string) => {
    if (mode === 'month') return monthLabel(d) === curMonth
    if (mode === 'custom') return (!start || d >= start) && (!end || d <= end)
    return true
  }

  const node = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex gap-1 rounded-md bg-muted p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              mode === m.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mode === 'month' && (
        <Select value={curMonth || undefined} onValueChange={setMonth} disabled={!months.length}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder={months.length ? 'Select month' : 'No data'} />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {mode === 'custom' && (
        <div className="flex items-center gap-2">
          <Input type="date" className="h-9 w-[150px]" value={start} onChange={(e) => setStart(e.target.value)} />
          <span className="text-sm text-muted-foreground">to</span>
          <Input type="date" className="h-9 w-[150px]" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      )}
    </div>
  )

  return { node, predicate }
}
