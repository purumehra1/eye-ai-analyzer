const EMOTION_CONFIG = {
  happy:     { emoji: '😊', color: 'bg-yellow-400' },
  sad:       { emoji: '😢', color: 'bg-blue-400' },
  angry:     { emoji: '😠', color: 'bg-red-500' },
  surprised: { emoji: '😲', color: 'bg-orange-400' },
  fear:      { emoji: '😨', color: 'bg-purple-400' },
  disgust:   { emoji: '🤢', color: 'bg-green-600' },
  neutral:   { emoji: '😐', color: 'bg-slate-400' },
}

export default function EmotionBars({ emotions, dominant }) {
  if (!emotions) return null
  const sorted = Object.entries(emotions).sort((a, b) => b[1] - a[1])

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">🎭 Emotion Analysis</h3>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-3xl">{EMOTION_CONFIG[dominant]?.emoji || '🙂'}</span>
        <div>
          <p className="text-xs text-slate-400">Dominant</p>
          <p className="font-bold text-white capitalize">{dominant}</p>
        </div>
      </div>
      <div className="space-y-2">
        {sorted.map(([emotion, score]) => {
          const cfg = EMOTION_CONFIG[emotion] || { emoji: '❓', color: 'bg-slate-400' }
          return (
            <div key={emotion} className="flex items-center gap-2">
              <span className="text-base w-6">{cfg.emoji}</span>
              <span className="text-xs text-slate-400 w-16 capitalize">{emotion}</span>
              <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                <div
                  className={`${cfg.color} h-1.5 rounded-full transition-all duration-700`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-10 text-right">{score.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
