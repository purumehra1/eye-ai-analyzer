const EMOTION_EMOJI = {
  happy: '😊', sad: '😢', angry: '😠', surprised: '😲',
  fear: '😨', disgust: '🤢', neutral: '😐',
}

export default function HistoryPanel({ history, onSelect, onClear }) {
  if (!history.length) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-slate-500">
        <span className="text-4xl">🕐</span>
        <p className="mt-2 text-sm">No analyses yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-300">Last {history.length} Analyses</h3>
        <button
          onClick={onClear}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear all
        </button>
      </div>
      {history.map((item, i) => (
        <div
          key={i}
          onClick={() => onSelect(item)}
          className="glass glass-hover rounded-xl p-4 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <img src={item.annotated_image || ''} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-800" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{EMOTION_EMOJI[item.dominant_emotion] || '🙂'}</span>
                <span className="text-sm font-medium capitalize text-white">{item.dominant_emotion}</span>
                {item.age && <span className="text-xs text-slate-400">· Age {item.age}</span>}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{item.fatigue}</p>
              <p className="text-xs text-slate-600 mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Stress</p>
              <p className={`text-sm font-bold ${item.stress_score > 60 ? 'text-red-400' : item.stress_score > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {item.stress_score}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
