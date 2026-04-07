export default function MetricCard({ label, value, unit = '%', color = 'violet', icon, description }) {
  const colors = {
    violet: { bar: 'bg-violet-500', glow: 'shadow-violet-500/20', text: 'text-violet-400' },
    blue:   { bar: 'bg-blue-500',   glow: 'shadow-blue-500/20',   text: 'text-blue-400' },
    green:  { bar: 'bg-emerald-500', glow: 'shadow-emerald-500/20', text: 'text-emerald-400' },
    red:    { bar: 'bg-red-500',    glow: 'shadow-red-500/20',    text: 'text-red-400' },
    amber:  { bar: 'bg-amber-500',  glow: 'shadow-amber-500/20',  text: 'text-amber-400' },
    cyan:   { bar: 'bg-cyan-500',   glow: 'shadow-cyan-500/20',   text: 'text-cyan-400' },
  }
  const c = colors[color] || colors.violet
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div className={`glass rounded-2xl p-4 shadow-lg ${c.glow}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400 font-medium">{icon} {label}</span>
        <span className={`text-2xl font-bold ${c.text}`}>{value}{unit}</span>
      </div>
      {description && <p className="text-xs text-slate-500 mb-2">{description}</p>}
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div
          className={`${c.bar} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
