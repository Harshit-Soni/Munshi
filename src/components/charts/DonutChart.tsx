import { ResponsivePie } from '@nivo/pie'
import { cssHsl, nivoTheme } from './chartTheme'
import { formatINR } from '@/lib/utils'

export type DonutDatum = { id: string; label: string; value: number; color: string }

export function DonutChart({ data }: { data: DonutDatum[] }) {
  if (!data.length) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data in this range.</div>
  }
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
      innerRadius={0.68}
      padAngle={1}
      cornerRadius={3}
      activeOuterRadiusOffset={6}
      colors={{ datum: 'data.color' }}
      borderWidth={2}
      borderColor={cssHsl('--card')}
      enableArcLabels={false}
      enableArcLinkLabels={false}
      theme={nivoTheme()}
      valueFormat={(v) => formatINR(Number(v))}
    />
  )
}
