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
  const playMode = useSoundStore((state) => state.playMode)
  const setPlayMode = useSoundStore((state) => state.setPlayMode)
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
      {/* Library Header / Search Area */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 mb-2 border-b border-white/5 shrink-0">
        
        {/* Left: Controls + Import */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto order-2 lg:order-1">
          
          {/* Play Mode + Volume (Leftmost) */}
          <div className="flex items-center gap-4 bg-white/5 dark:bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex items-center gap-2 flex-nowrap">
              <span className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40 whitespace-nowrap">Mode:</span>
              <div className="flex gap-1.5">
                {(['overlap', 'exclusive', 'queue'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPlayMode(mode)}
                    className={`
                      w-8 h-8 rounded-lg text-[10px] font-black shadow-md transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center border border-white/5
                      ${playMode === mode 
                        ? (mode === 'overlap' ? 'bg-sky-500 text-zinc-950 border-sky-400 shadow-sky-500/20' : 
                           mode === 'exclusive' ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-amber-500/20' : 
                           'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-emerald-500/20')
                        : 'bg-white/5 text-secondary hover:bg-white/10'}
                    `}
                    title={`โหมด ${mode === 'overlap' ? 'Overlap' : mode === 'exclusive' ? 'Exclusive' : 'Queue'}`}
                  >
                    {mode === 'overlap' ? 'O' : mode === 'exclusive' ? 'X' : 'Q'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-px h-6 bg-white/10" /> {/* Divider */}
            
            <div className="flex items-center gap-3 min-w-[160px]">
              <span className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40 whitespace-nowrap">Vol:</span>
              <input 
                type="range" min="0" max="200" value={libraryMasterVolume} 
                onChange={(e) => setLibraryMasterVolume(parseInt(e.target.value))}
                className="flex-1 h-1 bg-black/30 rounded-lg appearance-none cursor-pointer accent-tint"
              />
              <span className="text-[10px] font-black text-tint tabular-nums w-8 text-right">
                {libraryMasterVolume}%
              </span>
            </div>
          </div>
          
          {/* IMPORT LOCAL Button */}
          <button 
            onClick={handleImport}
            className="px-8 py-3 bg-gradient-to-br from-tint to-sky-600 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-tint/10 hover:shadow-tint/30 hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap order-1 sm:order-2"
          >
            {t.library?.import || 'IMPORT LOCAL'}
          </button>
        </div>

        {/* Right: Search Area */}
        <div className="flex items-center gap-4 order-1 lg:order-2">
          <div className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.library?.search} 
              className="w-72 rounded-2xl bg-white/5 border border-white/5 px-5 py-3 text-sm focus:outline-none focus:border-tint/30 transition-all placeholder:text-secondary/20 shadow-inner"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-secondary opacity-20">🔍</span>
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
