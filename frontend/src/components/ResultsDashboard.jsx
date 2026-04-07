import MetricCard from './MetricCard'
import EmotionBars from './EmotionBars'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts'

export default function ResultsDashboard({ data }) {
  if (!data) return null

  const { eye_metrics, fatigue, fatigue_score, stress_score, emotion, dominant_emotion, age, gender, annotated_image, face_detected } = data

  if (!face_detected) {
    return (
      <div className="glass rounded-2xl p-8 text-center mt-6">
        <span className="text-5xl">🔍</span>
        <p className="mt-3 text-slate-300 font-medium">No face detected</p>
        <p className="text-sm text-slate-500 mt-1">Try a clear, well-lit frontal photo</p>
      </div>
    )
  }

  const radarData = [
    { metric: 'Eye Clarity', value: eye_metrics?.eye_clarity || 0 },
    { metric: 'Alertness', value: Math.max(0, 100 - fatigue_score) },
    { metric: 'Calm', value: Math.max(0, 100 - stress_score) },
    { metric: 'Freshness', value: Math.max(0, 100 - (eye_metrics?.dark_circle_index || 0)) },
    { metric: 'Eye Health', value: Math.max(0, 100 - (eye_metrics?.redness_score || 0)) },
    { metric: 'Sharpness', value: Math.max(0, 100 - (eye_metrics?.puffiness_score || 0)) },
  ]

  return (
    <div className="mt-6 space-y-4">
      {/* Annotated Image */}
      {annotated_image && (
        <div className="glass rounded-2xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-2">📍 Detected regions</p>
          <img src={annotated_image} alt="Analyzed" className="rounded-xl max-h-64 mx-auto object-contain" />
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3">
        {age && (
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400">Estimated Age</p>
            <p className="text-3xl font-bold text-cyan-400">{age}</p>
          </div>
        )}
        {gender && (
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400">Gender</p>
            <p className="text-3xl font-bold text-pink-400">{gender === 'Man' ? '♂️' : '♀️'} {gender}</p>
          </div>
        )}
      </div>

      {/* Radar Chart */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">📊 Overall Eye Health Radar</h3>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }}
              formatter={(v) => [`${v.toFixed(1)}%`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Fatigue + Stress */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Fatigue Level"
          value={fatigue_score}
          icon="😴"
          color={fatigue_score > 65 ? 'red' : fatigue_score > 35 ? 'amber' : 'green'}
          description={fatigue}
        />
        <MetricCard
          label="Stress Score"
          value={stress_score}
          icon="🧠"
          color={stress_score > 65 ? 'red' : stress_score > 35 ? 'amber' : 'green'}
        />
      </div>

      {/* Eye Metrics */}
      {eye_metrics && (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Eye Clarity" value={eye_metrics.eye_clarity} icon="👁️" color="cyan" />
          <MetricCard label="Redness" value={eye_metrics.redness_score} icon="🔴" color="red" />
          <MetricCard label="Dark Circles" value={eye_metrics.dark_circle_index} icon="🌑" color="violet" />
          <MetricCard label="Puffiness" value={eye_metrics.puffiness_score} icon="💧" color="blue" />
        </div>
      )}

      {/* Emotions */}
      <EmotionBars emotions={emotion} dominant={dominant_emotion} />
    </div>
  )
}
