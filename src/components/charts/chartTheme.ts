export function cssHsl(varName: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return v ? `hsl(${v})` : '#888'
}

export const CHART_PALETTE = [
  '#6366f1',
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
]

export function nivoTheme() {
  const text = cssHsl('--muted-foreground')
  const grid = cssHsl('--border')
  return {
    text: { fill: text, fontFamily: 'Inter' },
    axis: {
      ticks: { text: { fill: text, fontSize: 11 } },
      domain: { line: { stroke: grid } },
    },
    grid: { line: { stroke: grid, strokeWidth: 1 } },
    tooltip: {
      container: {
        background: cssHsl('--popover'),
        color: cssHsl('--popover-foreground'),
        fontSize: 12,
        borderRadius: 6,
        border: `1px solid ${grid}`,
      },
    },
  }
}
