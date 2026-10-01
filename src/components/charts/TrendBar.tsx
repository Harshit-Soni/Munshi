import { ResponsiveBar } from '@nivo/bar'
import { nivoTheme } from './chartTheme'
import { formatINR } from '@/lib/utils'

export type TrendDatum = { month: string; value: number; color: string }

export function TrendBar({ data }: { data: TrendDatum[] }) {
  if (!data.length) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet.</div>
  }
  return (
    <ResponsiveBar
      data={data}
      keys={['value']}
      indexBy="month"
      margin={{ top: 10, right: 10, bottom: 40, left: 52 }}
      padding={0.35}
      colors={(bar) => (bar.data as TrendDatum).color}
      enableLabel={false}
      axisLeft={{
        tickSize: 0,
        tickPadding: 8,
        format: (v) => (Number(v) >= 1000 ? `${Number(v) / 1000}k` : `${v}`),
      }}
      axisBottom={{ tickSize: 0, tickPadding: 8 }}
      enableGridX={false}
      theme={nivoTheme()}
      valueFormat={(v) => formatINR(Number(v))}
    />
  )
}
