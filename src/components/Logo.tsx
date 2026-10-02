import { useId } from 'react'

/** Munshi hex-chip mark. Per-instance ids so multiple copies don't collide. */
export function Logo({ className }: { className?: string }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '')
  const n = `n${raw}`
  const t = `t${raw}`
  const g = `g${raw}`
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Munshi">
      <defs>
        <linearGradient id={n} x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset=".5" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id={t} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d2622" />
          <stop offset="1" stopColor="#07171f" />
        </linearGradient>
        <filter id={g} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${t})`} />
      <rect x=".5" y=".5" width="63" height="63" rx="15.5" fill="none" stroke="#fff" strokeOpacity=".06" />
      <g filter={`url(#${g})`}>
        <path d="M32 13l16.5 9.5v19L32 51 15.5 41.5v-19z" fill="none" stroke={`url(#${n})`} strokeWidth="3" strokeLinejoin="round" />
        <g stroke={`url(#${n})`} strokeWidth="2.6" strokeLinecap="round">
          <path d="M25 27h14" />
          <path d="M25 32h11" />
          <path d="M25 37h8" />
        </g>
        <circle cx="41.5" cy="27" r="2.1" fill="#4ade80" />
      </g>
    </svg>
  )
}
