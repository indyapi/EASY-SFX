import React from 'react'
import { useSoundStore } from '../store/useSoundStore'

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const theme = useSoundStore((state) => state.theme)
  const language = useSoundStore((state) => state.language)
  const gridColumns = useSoundStore((state) => state.gridColumns)
  const libraryMasterVolume = useSoundStore((state) => state.libraryMasterVolume)
  const playMode = useSoundStore((state) => state.playMode)
  const setTheme = useSoundStore((state) => state.setTheme)
  const setLanguage = useSoundStore((state) => state.setLanguage)
  const setGridColumns = useSoundStore((state) => state.setGridColumns)
  const setLibraryMasterVolume = useSoundStore((state) => state.setLibraryMasterVolume)
  const setPlayMode = useSoundStore((state) => state.setPlayMode)
  const t = useSoundStore((state) => state.translations)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <div className="flex w-full max-w-md flex-col rounded-3xl card-bg border shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b nav-bg">
          <h2 className="text-xl font-black uppercase tracking-tight text-primary">{t.settings?.title}</h2>
          <button onClick={onClose} className="text-2xl hover:text-tint transition-colors">×</button>
        </div>

        <div className="flex flex-1 flex-col gap-8 p-8 overflow-y-auto custom-scrollbar">
          {/* Theme Selection */}
          <div className="flex flex-col gap-4">
            <label className="text-xs font-black uppercase tracking-widest text-secondary opacity-70">
              {t.settings?.theme}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['dark', 'light'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={`
                    px-4 py-3 rounded-xl border font-bold transition-all
                    ${theme === mode 
                      ? 'border-tint text-tint bg-tint/5 shadow-inner' 
                      : 'border-transparent nav-bg text-secondary hover:border-zinc-700'}
                  `}
                >
                  {mode === 'dark' ? t.settings?.dark : t.settings?.light}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="flex flex-col gap-4">
            <label className="text-xs font-black uppercase tracking-widest text-secondary opacity-70">
              {t.settings?.language}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('en')}
                className={`
                  px-4 py-3 rounded-xl border font-bold transition-all
                  ${language === 'en' 
                    ? 'border-tint text-tint bg-tint/5 shadow-inner' 
                    : 'border-transparent nav-bg text-secondary hover:border-zinc-700'}
                `}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('th')}
                className={`
                  px-4 py-3 rounded-xl border font-bold transition-all
                  ${language === 'th' 
                    ? 'border-tint text-tint bg-tint/5 shadow-inner' 
                    : 'border-transparent nav-bg text-secondary hover:border-zinc-700'}
                `}
              >
                ไทย
              </button>
            </div>
          </div>

          {/* Master Volume */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-secondary opacity-70">
                {t.playlist?.masterVolume}
              </label>
              <span className="text-sm font-black text-tint">{libraryMasterVolume}%</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={libraryMasterVolume} 
                onChange={(e) => setLibraryMasterVolume(parseInt(e.target.value))}
                className="w-full h-1.5 bg-nav rounded-lg appearance-none cursor-pointer accent-tint"
              />
            </div>
          </div>

          {/* Grid Size Adjustment */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-secondary opacity-70">
                {t.settings?.gridSize}
              </label>
              <span className="text-sm font-black text-tint">{gridColumns}</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="4" 
                max="18" 
                value={gridColumns} 
                onChange={(e) => setGridColumns(parseInt(e.target.value))}
                className="w-full h-1.5 bg-nav rounded-lg appearance-none cursor-pointer accent-tint"
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-secondary opacity-40">
              <span>4</span>
              <span>11</span>
              <span>18</span>
            </div>
          </div>

          {/* Playback Mode */}
          <div className="flex flex-col gap-4">
            <label className="text-xs font-black uppercase tracking-widest text-secondary opacity-70">
              {t.settings?.playMode}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(['overlap', 'exclusive', 'queue'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPlayMode(mode)}
                  className={`
                    px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between
                    ${playMode === mode 
                      ? 'border-tint text-tint bg-tint/5 shadow-inner' 
                      : 'border-transparent nav-bg text-secondary hover:border-zinc-700'}
                  `}
                >
                  <span>{t.settings?.[mode]}</span>
                  {playMode === mode && <span className="text-[8px]">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 nav-bg border-t">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-2xl btn-tint shadow-lg shadow-tint/20"
          >
            {t.settings?.done}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
