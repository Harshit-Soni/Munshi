import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ArrowDown, ArrowUp, Percent, PiggyBank, Scale, Wallet } from 'lucide-react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, formatINR, monthLabel, monthSortKey, monthFirstDay, prevMonthLabel, todayISO } from '@/lib/utils'
import type { Category, Kind, Transaction } from '@/types/database'
import { useFinanceData } from '@/data/FinanceProvider'
import { useTheme } from '@/context/ThemeProvider'
import { CHART_PALETTE } from '@/components/charts/chartTheme'
import { DonutChart, type DonutDatum } from '@/components/charts/DonutChart'
import { TrendBar, type TrendDatum } from '@/components/charts/TrendBar'

type Mode = 'month' | 'year' | 'all' | 'custom'

const MODES: { id: Mode; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom' },
]

function sum(txs: Transaction[]) {
  return txs.reduce((s, t) => s + Number(t.amount || 0), 0)
}

function categoryBreakdown(txs: Transaction[], cats: Category[]) {
  return cats
    .map((c, i) => ({
      name: c.name,
      total: sum(txs.filter((t) => t.category_id === c.id)),
      color: CHART_PALETTE[i % CHART_PALETTE.length],
    }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
}

function TrendPill({ cur, prev, show }: { cur: number; prev: number; show: boolean }) {
  if (!show) return null
  if (!prev) {
    return <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{cur ? 'New' : '—'}</span>
  }
  const pct = ((cur - prev) / Math.abs(prev)) * 100
  const up = pct >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
        up ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
      )}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

const statsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const cardItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

function StatTile({
  icon,
  tint,
  label,
  value,
  pill,
  sub,
}: {
  icon: ReactNode
  tint: string
  label: string
  value: ReactNode
  pill: ReactNode
  sub?: string
}) {
  return (
    <motion.div variants={cardItem}>
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-md', tint)}>{icon}</div>
          {pill}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </Card>
    </motion.div>
  )
}

function Legend({ rows, grand }: { rows: { name: string; total: number; color: string }[]; grand: number }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No data in this range.</p>
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center justify-between gap-3 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
            <span className="truncate">{r.name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-medium">{formatINR(r.total)}</span>
            <span className="w-10 text-right text-xs text-muted-foreground">{grand ? ((r.total / grand) * 100).toFixed(0) : '0'}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Section({
  kind,
  title,
  txs,
  cats,
  allTxs,
  inRange,
  rangeActive,
}: {
  kind: Kind
  title: string
  txs: Transaction[]
  cats: Category[]
  allTxs: Transaction[]
  inRange: (d: string) => boolean
  rangeActive: boolean
}) {
  const rows = categoryBreakdown(txs, cats)
  const grand = sum(txs)
  const donut: DonutDatum[] = rows.map((r) => ({ id: r.name, label: r.name, value: r.total, color: r.color }))

  const monthMap = new Map<string, number>()
  allTxs.forEach((t) => monthMap.set(monthLabel(t.date), (monthMap.get(monthLabel(t.date)) ?? 0) + Number(t.amount || 0)))
  const months = [...monthMap.keys()].sort((a, b) => monthSortKey(a) - monthSortKey(b))
  const base = kind === 'expense' ? '#ef4444' : '#10b981'
  const trend: TrendDatum[] = months.map((m) => ({
    month: m.replace(' ', "\n"),
    value: monthMap.get(m) ?? 0,
    color: rangeActive && inRange(monthFirstDay(m)) ? base : base + '55',
  }))

  return (
    <>
      <h2 className="mb-3 text-base font-semibold tracking-tight">{title}</h2>
      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Monthly Trend</CardTitle>
            <span className="text-xs text-muted-foreground">Selected range highlighted</span>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <TrendBar data={trend} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <DonutChart data={donut} />
            </div>
            <div className="mt-5">
              <Legend rows={rows} grand={grand} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function CoverageCard({ salary, spent, saved, month }: { salary: number; spent: number; saved: number; month: string }) {
  if (salary <= 0) {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold tracking-tight">Salary coverage</div>
            <div className="text-sm text-muted-foreground">Set your monthly salary to see how much is accounted for.</div>
          </div>
          <Link to="/settings" className="text-sm font-medium text-primary hover:underline">
            Set salary →
          </Link>
        </CardContent>
      </Card>
    )
  }
  const accounted = spent + saved
  const denom = Math.max(salary, accounted, 1)
  const unlogged = Math.max(salary - accounted, 0)
  const over = Math.max(accounted - salary, 0)
  const coveredPct = Math.min((accounted / salary) * 100, 100)
  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">Salary coverage · {month}</div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{coveredPct.toFixed(0)}%</span> of {formatINR(salary)}
          </div>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-destructive" style={{ width: `${(spent / denom) * 100}%` }} />
          <div className="h-full bg-success" style={{ width: `${(saved / denom) * 100}%` }} />
          <div className="h-full" style={{ width: `${(unlogged / denom) * 100}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" /> Spent {formatINR(spent)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" /> Saved {formatINR(saved)}
          </span>
          {over > 0 ? (
            <span className="text-destructive">Over salary by {formatINR(over)}</span>
          ) : (
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{formatINR(unlogged)}</span> not tracked yet
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  useTheme() // subscribe so charts recolor when the theme toggles
  const { transactions, categories, currentSalary } = useFinanceData()
  const [mode, setMode] = useState<Mode>('all')
  const [monthVal, setMonthVal] = useState('')
  const [yearVal, setYearVal] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const expCats = useMemo(() => categories.filter((c) => c.kind === 'expense'), [categories])
  const savCats = useMemo(() => categories.filter((c) => c.kind === 'saving'), [categories])

  const months = useMemo(() => {
    const s = new Set<string>()
    transactions.forEach((t) => s.add(monthLabel(t.date)))
    return [...s].sort((a, b) => monthSortKey(a) - monthSortKey(b))
  }, [transactions])
  const years = useMemo(() => {
    const s = new Set<string>()
    transactions.forEach((t) => s.add(t.date.slice(0, 4)))
    return [...s].sort()
  }, [transactions])

  const curMonth = monthVal || months[months.length - 1] || ''
  const curYear = yearVal || years[years.length - 1] || ''

  const inRange = (d: string) => {
    if (mode === 'month') return monthLabel(d) === curMonth
    if (mode === 'year') return d.slice(0, 4) === curYear
    if (mode === 'custom') return (!start || d >= start) && (!end || d <= end)
    return true
  }

  const exp = transactions.filter((t) => t.kind === 'expense')
  const sav = transactions.filter((t) => t.kind === 'saving')
  const expF = exp.filter((t) => inRange(t.date))
  const savF = sav.filter((t) => inRange(t.date))

  // Salary coverage is always the *current* calendar month, independent of the range filter.
  const thisMonth = monthLabel(todayISO())
  const spentThisMonth = sum(exp.filter((t) => monthLabel(t.date) === thisMonth))
  const savedThisMonth = sum(sav.filter((t) => monthLabel(t.date) === thisMonth))

  const totalExp = sum(expF)
  const totalSav = sum(savF)
  const rate = totalExp + totalSav > 0 ? (totalSav / (totalExp + totalSav)) * 100 : 0

  // previous period
  const showTrend = mode === 'month' || mode === 'year'
  let prevExp = 0,
    prevSav = 0,
    subText = ''
  if (mode === 'month' && curMonth) {
    const pm = prevMonthLabel(curMonth)
    prevExp = sum(exp.filter((t) => monthLabel(t.date) === pm))
    prevSav = sum(sav.filter((t) => monthLabel(t.date) === pm))
    subText = 'vs last month'
  } else if (mode === 'year' && curYear) {
    const py = String(Number(curYear) - 1)
    prevExp = sum(exp.filter((t) => t.date.slice(0, 4) === py))
    prevSav = sum(sav.filter((t) => t.date.slice(0, 4) === py))
    subText = 'vs last year'
  }
  const prevRate = prevExp + prevSav > 0 ? (prevSav / (prevExp + prevSav)) * 100 : 0

  return (
    <div>
      <CoverageCard salary={currentSalary} spent={spentThisMonth} saved={savedThisMonth} month={thisMonth} />
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Viewing</span>
            <div className="inline-flex flex-wrap gap-1 rounded-md bg-muted p-1">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    'relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    mode === m.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {mode === m.id && (
                    <motion.span
                      layoutId="rangePill"
                      className="absolute inset-0 rounded-md bg-background shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {mode === 'month' && (
              <Select value={curMonth || undefined} onValueChange={setMonthVal} disabled={!months.length}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={months.length ? 'Select month' : 'No data yet'} />
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
            {mode === 'year' && (
              <Select value={curYear || undefined} onValueChange={setYearVal} disabled={!years.length}>
                <SelectTrigger className="min-w-[120px]">
                  <SelectValue placeholder={years.length ? 'Select year' : 'No data yet'} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {mode === 'custom' && (
              <div className="flex items-center gap-2">
                <Input type="date" className="w-[150px]" value={start} onChange={(e) => setStart(e.target.value)} />
                <span className="text-sm text-muted-foreground">to</span>
                <Input type="date" className="w-[150px]" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <motion.div
        className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4"
        variants={statsContainer}
        initial="hidden"
        animate="show"
      >
        <StatTile
          icon={<Wallet className="h-[18px] w-[18px] text-destructive" />}
          tint="bg-destructive/10"
          label="Total Expense"
          value={<AnimatedNumber value={totalExp} format={formatINR} />}
          pill={<TrendPill cur={totalExp} prev={prevExp} show={showTrend} />}
          sub={showTrend ? subText : undefined}
        />
        <StatTile
          icon={<PiggyBank className="h-[18px] w-[18px] text-success" />}
          tint="bg-success/10"
          label="Total Savings"
          value={<AnimatedNumber value={totalSav} format={formatINR} />}
          pill={<TrendPill cur={totalSav} prev={prevSav} show={showTrend} />}
          sub={showTrend ? subText : undefined}
        />
        <StatTile
          icon={<Scale className="h-[18px] w-[18px] text-primary" />}
          tint="bg-primary/10"
          label="Savings − Expense"
          value={<AnimatedNumber value={totalSav - totalExp} format={formatINR} />}
          pill={<TrendPill cur={totalSav - totalExp} prev={prevSav - prevExp} show={showTrend} />}
          sub={showTrend ? subText : undefined}
        />
        <StatTile
          icon={<Percent className="h-[18px] w-[18px] text-foreground" />}
          tint="bg-accent"
          label="Savings Rate"
          value={<AnimatedNumber value={rate} format={(v) => `${v.toFixed(1)}%`} />}
          pill={<TrendPill cur={rate} prev={prevRate} show={showTrend} />}
          sub={showTrend ? subText : undefined}
        />
      </motion.div>

      <Section kind="expense" title="Expense Breakdown" txs={expF} cats={expCats} allTxs={exp} inRange={inRange} rangeActive={mode !== 'all'} />
      <Section kind="saving" title="Savings Breakdown" txs={savF} cats={savCats} allTxs={sav} inRange={inRange} rangeActive={mode !== 'all'} />
    </div>
  )
}
