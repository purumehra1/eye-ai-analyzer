import { useState, useRef, useCallback, useEffect } from 'react'
import axios from 'axios'
import Webcam from 'react-webcam'
import ResultsDashboard from './components/ResultsDashboard'
import HistoryPanel from './components/HistoryPanel'

const TABS = ['Analyze', 'History']
const HISTORY_KEY = 'eye_ai_history'

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full spin-slow" />
      <p className="text-slate-400 text-sm animate-pulse">Analyzing your image...</p>
      <p className="text-slate-600 text-xs">Running local AI models</p>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('Analyze')
  const [mode, setMode] = useState('upload') // 'upload' | 'webcam'
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
  })
  const [backendOk, setBackendOk] = useState(null)
  const webcamRef = useRef(null)
  const fileRef = useRef(null)

  // Health check
  useEffect(() => {
    axios.get('/health').then(() => setBackendOk(true)).catch(() => setBackendOk(false))
  }, [])

  const saveHistory = (item) => {
    setHistory(prev => {
      const updated = [item, ...prev].slice(0, 10)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const analyze = async (imageFile) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', imageFile)
      const { data } = await axios.post('/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(data)
      saveHistory({ ...data, timestamp: Date.now() })
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const onFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError(null)
  }

  const captureWebcam = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) return
    setPreview(imageSrc)
    // Convert base64 to blob
    fetch(imageSrc).then(r => r.blob()).then(blob => {
      const f = new File([blob], 'webcam.jpg', { type: 'image/jpeg' })
      setFile(f)
      setResult(null)
      setError(null)
    })
  }, [webcamRef])

  const reset = () => {
    setPreview(null)
    setFile(null)
    setResult(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold gradient-text">👁️ EyeAI Analyzer</h1>
            <p className="text-xs text-slate-500">Emotion · Fatigue · Stress · Health — 100% Local</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${backendOk === true ? 'bg-emerald-400' : backendOk === false ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-xs text-slate-400">{backendOk === true ? 'Backend ready' : backendOk === false ? 'Backend offline' : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'Analyze' ? '🔬' : '🕐'} {t}
            </button>
          ))}
        </div>

        {tab === 'Analyze' && (
          <>
            {/* Mode toggle */}
            <div className="flex gap-1 glass rounded-xl p-1 mb-4">
              {['upload', 'webcam'].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); reset() }}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                    mode === m ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'upload' ? '📤 Upload Image' : '📹 Webcam'}
                </button>
              ))}
            </div>

            {/* Upload mode */}
            {mode === 'upload' && !preview && (
              <div
                onClick={() => fileRef.current?.click()}
                className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/50 transition-all cursor-pointer p-12 text-center"
              >
                <div className="text-5xl mb-3">📸</div>
                <p className="text-slate-300 font-medium">Drop an image or click to upload</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP · Max 10MB</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </div>
            )}

            {/* Webcam mode */}
            {mode === 'webcam' && !preview && (
              <div className="space-y-3">
                <div className="glass rounded-2xl overflow-hidden">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-2xl"
                    videoConstraints={{ facingMode: 'user' }}
                  />
                </div>
                <button
                  onClick={captureWebcam}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 rounded-xl text-white font-medium transition-colors"
                >
                  📸 Capture
                </button>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="space-y-3">
                <div className="glass rounded-2xl overflow-hidden relative">
                  <img src={preview} alt="Preview" className="w-full max-h-64 object-contain bg-black/30" />
                  <button
                    onClick={reset}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>
                {!result && !loading && (
                  <button
                    onClick={() => file && analyze(file)}
                    disabled={!file || backendOk === false}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-colors glow"
                  >
                    🔬 Analyze Image
                  </button>
                )}
              </div>
            )}

            {/* Backend offline warning */}
            {backendOk === false && (
              <div className="mt-4 glass rounded-xl p-4 border border-red-500/30">
                <p className="text-red-400 text-sm font-medium">⚠️ Backend not running</p>
                <p className="text-xs text-slate-400 mt-1">Start it with: <code className="text-violet-300">cd backend && python main.py</code></p>
              </div>
            )}

            {/* Loading */}
            {loading && <LoadingSpinner />}

            {/* Error */}
            {error && (
              <div className="mt-4 glass rounded-xl p-4 border border-red-500/30">
                <p className="text-red-400 text-sm">❌ {error}</p>
              </div>
            )}

            {/* Results */}
            {result && <ResultsDashboard data={result} />}

            {/* Re-analyze button */}
            {result && (
              <button
                onClick={reset}
                className="w-full mt-4 py-3 glass glass-hover rounded-xl text-slate-300 font-medium transition-colors"
              >
                🔄 Analyze Another
              </button>
            )}
          </>
        )}

        {tab === 'History' && (
          <HistoryPanel
            history={history}
            onSelect={(item) => { setResult(item); setTab('Analyze'); setPreview(item.annotated_image) }}
            onClear={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY) }}
          />
        )}
      </div>
    </div>
  )
}
