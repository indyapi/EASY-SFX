import React, { useState } from 'react'
import { useSoundStore } from '../store/useSoundStore'
import { audioService } from '../services/audio.service'
import { SFX } from '../types'

interface SFXCardProps {
  sfx: SFX
  onDelete?: () => void
}

const SFXCard: React.FC<SFXCardProps> = ({ sfx, onDelete }) => {
  const t = useSoundStore((state) => state.translations)
  const playingSfxId = useSoundStore((state) => state.playingSfxId)
  const favorites = useSoundStore((state) => state.favorites)
  const updateFavoriteFolder = useSoundStore((state) => state.updateFavoriteFolder)
  const isPlaying = playingSfxId === sfx.id
  
  const [clickPos, setClickPos] = useState<{ x: number, y: number } | null>(null)
  const [showFavList, setShowFavList] = useState(false)

  const handlePlay = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setClickPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => setClickPos(null), 600)
    audioService.play(sfx)
  }

  const handleAddToFav = async (e: React.MouseEvent, folder: any) => {
    e.stopPropagation()
    if (!folder.items.includes(sfx.id)) {
      await updateFavoriteFolder({ ...folder, items: [...folder.items, sfx.id] })
    }
    setShowFavList(false)
  }

  return (
    <div 
      onClick={handlePlay}
      onMouseLeave={() => setShowFavList(false)}
      className={`
        group relative aspect-square rounded-2xl border p-4 transition-all duration-300
        hover:-translate-y-1 hover:shadow-2xl hover:shadow-tint/10 cursor-pointer card-bg overflow-hidden
        ${isPlaying ? 'border-tint shadow-lg shadow-tint/20 ring-1 ring-tint/50 animate-pulse-subtle' : ''}
      `}
    >
      {/* Wave Effect */}
      {clickPos && (
        <span 
          className="absolute rounded-full bg-tint/30 animate-ping pointer-events-none"
          style={{ left: clickPos.x, top: clickPos.y, width: '10px', height: '10px', transform: 'translate(-50%, -50%)' }}
        />
      )}

      <div className="flex h-full flex-col items-center justify-center gap-2">
        <div className={`text-3xl transition-transform duration-500 ${isPlaying ? 'scale-125 rotate-12' : 'group-hover:scale-110'}`}>
          {isPlaying ? '📻' : '🔊'}
        </div>
        <div className="text-center w-full">
          <p className={`text-[10px] font-black truncate px-1 transition-colors ${isPlaying ? 'text-tint' : 'text-primary opacity-80'}`} title={sfx.name}>
            {sfx.name}
          </p>
          {isPlaying ? (
            <span className="text-[8px] font-black text-tint animate-pulse uppercase tracking-tighter">Playing...</span>
          ) : (
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter border nav-bg text-secondary opacity-50">
              {sfx.source}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!isPlaying && (
        <div className="absolute top-1.5 right-1.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowFavList(!showFavList); }}
              className="h-7 w-7 rounded-lg nav-bg text-primary flex items-center justify-center border border-transparent hover:border-tint/30 hover:bg-tint hover:text-black transition-all text-xs shadow-lg"
              title={t.common?.add}
            >
              ➕
            </button>
            
            {showFavList && (
              <div className="absolute right-0 top-8 z-[60] w-48 nav-bg border rounded-2xl shadow-2xl p-1.5 animate-scale-in">
                <p className="text-[8px] font-black text-secondary uppercase p-2 opacity-50 border-b border-white/5 mb-1 tracking-widest text-center">Add to Save</p>
                <div className="max-h-40 overflow-y-auto custom-scrollbar">
                  {favorites.map(f => {
                      const isAdded = f.items.includes(sfx.id);
                      return (
                        <button 
                          key={f.id}
                          onClick={(e) => handleAddToFav(e, f)}
                          disabled={isAdded}
                          className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-tight rounded-xl transition-all mb-1 flex items-center justify-between
                            ${isAdded ? 'opacity-30 cursor-default' : 'text-primary hover:bg-tint hover:text-black'}`}
                        >
                          <span className="truncate flex-1 pr-2">📁 {f.name}</span>
                          {isAdded && <span className="text-[8px]">✓</span>}
                        </button>
                      );
                  })}
                  {favorites.length === 0 && <p className="text-[8px] text-secondary p-4 italic text-center opacity-40">No Saves created</p>}
                </div>
              </div>
            )}
          </div>

          {sfx.source === 'local' && onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); if(confirm('Delete permanently?')) onDelete(); }}
              className="h-7 w-7 rounded-lg bg-red-900/10 text-red-500 border border-transparent hover:border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-xs shadow-lg"
              title={t.common?.delete}
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SFXCard
