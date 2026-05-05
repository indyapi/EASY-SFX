import React, { useState } from 'react'
import { useSoundStore } from '../store/useSoundStore'
import SFXCard from './SFXCard'

const LibraryTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  
  const localSounds = useSoundStore((state) => state.sounds)
  const isStoreLoading = useSoundStore((state) => state.isLoading)
  const importLocalSound = useSoundStore((state) => state.importLocalSound)
  const removeSound = useSoundStore((state) => state.removeSound)
  const libraryMasterVolume = useSoundStore((state) => state.libraryMasterVolume)
  const setLibraryMasterVolume = useSoundStore((state) => state.setLibraryMasterVolume)
  const t = useSoundStore((state) => state.translations)
  const gridColumns = useSoundStore((state) => state.gridColumns)

  const handleImport = async () => {
    const path = await window.api.selectFile()
    if (path) {
      await importLocalSound(path)
    }
  }

  const filteredLocal = localSounds.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-hidden">
      {/* Header / Search Area */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">{t.library?.title}</h2>
          <p className="text-[9px] font-bold text-secondary opacity-30 uppercase tracking-[0.2em] mt-0.5">Your personal sound collection</p>
        </div>

        <div className="flex items-center gap-8">
          {/* Library Master Volume */}
          <div className="flex items-center gap-4 px-6 py-2 rounded-2xl nav-bg border border-white/5">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[8px] font-black text-secondary opacity-30 uppercase tracking-widest">Master Volume</span>
              <span className="text-[10px] font-black text-tint">{libraryMasterVolume}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={libraryMasterVolume} 
              onChange={(e) => setLibraryMasterVolume(parseInt(e.target.value))}
              className="w-32 h-1 bg-black/30 rounded-lg appearance-none cursor-pointer accent-tint"
            />
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={handleImport}
              className="text-xs font-black text-tint hover:underline transition-all uppercase tracking-widest"
            >
              {t.library?.import}
            </button>
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.library?.search} 
                className="w-64 rounded-xl card-bg border border-white/5 px-4 py-2.5 text-sm focus:outline-none focus:border-tint/50 transition-all placeholder:text-secondary/30"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary opacity-20">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {isStoreLoading && filteredLocal.length === 0 ? (
          <div className="flex h-full items-center justify-center">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-tint border-t-transparent" />
          </div>
        ) : filteredLocal.length === 0 ? (
          <div className="flex h-full items-center justify-center text-secondary italic text-center">
            {searchQuery 
              ? t.library?.notFound 
              : t.library?.noSounds}
          </div>
        ) : (
          <div 
            className="grid gap-4 pb-12"
            style={{ 
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` 
            }}
          >
            {filteredLocal.map((sfx) => (
              <SFXCard key={sfx.id} sfx={sfx} onDelete={() => removeSound(sfx.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LibraryTab
