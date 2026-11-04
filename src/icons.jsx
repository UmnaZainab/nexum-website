import React from 'react'

function BaseIcon({ children, size = 24, strokeWidth = 2, className = '', ...props }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
}
export const ArrowUpRight = p => <BaseIcon {...p}><path d="M7 17 17 7M7 7h10v10"/></BaseIcon>
export const BarChart3 = p => <BaseIcon {...p}><path d="M3 3v18h18M7 16v-5M12 16V7M17 16v-3"/></BaseIcon>
export const ChartNoAxesCombined = p => <BaseIcon {...p}><path d="m3 17 5-5 4 4 8-9M18 7h2v2M5 20v-4M10 20v-2M15 20v-6M20 20v-8"/></BaseIcon>
export const CheckCircle2 = p => <BaseIcon {...p}><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></BaseIcon>
export const Globe2 = p => <BaseIcon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></BaseIcon>
export const Layers3 = p => <BaseIcon {...p}><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></BaseIcon>
export const Mail = p => <BaseIcon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></BaseIcon>
export const Megaphone = p => <BaseIcon {...p}><path d="m3 11 15-6v14L3 13v-2Z"/><path d="M6 14v5h4v-3"/></BaseIcon>
export const Moon = p => <BaseIcon {...p}><path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z"/></BaseIcon>
export const PenTool = p => <BaseIcon {...p}><path d="m12 19 7-7-7-7-7 7 7 7Z"/><circle cx="12" cy="12" r="2"/><path d="M5 5 3 3M19 5l2-2"/></BaseIcon>
export const Search = p => <BaseIcon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></BaseIcon>
export const Sun = p => <BaseIcon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></BaseIcon>
export const Target = p => <BaseIcon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></BaseIcon>
export const TrendingUp = p => <BaseIcon {...p}><path d="M3 17 9 11l4 4 8-9M15 6h6v6"/></BaseIcon>
export const Users = p => <BaseIcon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></BaseIcon>
export const X = p => <BaseIcon {...p}><path d="M18 6 6 18M6 6l12 12"/></BaseIcon>
