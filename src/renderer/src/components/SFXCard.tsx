import React, { useState } from 'react'
import { useSoundStore } from '../store/useSoundStore'
import { audioService } from '../services/audio.service'
import { SFX } from '../types'
import { Trash2, Play } from 'lucide-react'

interface SFXCardProps {
  sfx: SFX
  onDelete?: () => void
  className?: string
}

const SFXCard: React.FC<SFXCardProps> = ({ sfx, onDelete, className }) => {
  const playingSfxId = useSoundStore((state) => state.playingSfxId)
  const isPlaying = playingSfxId === sfx.id
  
  const [clickPos, setClickPos] = useState<{ x: number, y: number } | null>(null)

  const handlePlay = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setClickPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => setClickPos(null), 600)
    audioService.play(sfx)
  }

  return (
    <div 
      onClick={handlePlay}
      className={`
        group relative rounded-[28px] border transition-all duration-300
        hover:-translate-y-1 hover:shadow-2xl hover:shadow-tint/10 cursor-pointer card-bg overflow-hidden flex flex-col h-full min-h-[140px]
        ${isPlaying ? 'border-tint shadow-lg shadow-tint/20 ring-1 ring-tint/50 animate-pulse-subtle' : 'border-white/5'}
        ${className}
      `}
    >
      {/* Wave Effect */}
      {clickPos && (
        <span 
          className="absolute rounded-full bg-tint/30 animate-ping pointer-events-none"
          style={{ left: clickPos.x, top: clickPos.y, width: '10px', height: '10px', transform: 'translate(-50%, -50%)' }}
        />
      )}

      <div className="flex h-full flex-col p-5 gap-3">
        <div className="flex items-start justify-between w-full">
           <div className={`
              h-12 w-12 rounded-[18px] bg-black/40 border border-white/5 flex items-center justify-center text-xl transition-transform duration-500
              ${isPlaying ? 'scale-110 rotate-12 text-tint' : 'group-hover:scale-105 text-primary/40'}
           `}>
             {isPlaying ? <span className="animate-pulse">📻</span> : <Play size={20} className="ml-1 fill-current opacity-20" />}
           </div>

           {sfx.source === 'local' && onDelete && !isPlaying && (
              <button 
                onClick={(e) => { e.stopPropagation(); if(confirm('Delete sound?')) onDelete(); }}
                className="h-8 w-8 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center shadow-lg"
              >
                <Trash2 size={14} />
              </button>
           )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <p className={`text-[13px] font-black uppercase tracking-tight line-clamp-2 transition-colors mb-1 ${isPlaying ? 'text-tint' : 'text-primary'}`} title={sfx.name}>
            {sfx.name}
          </p>
          <div className="mt-auto">
             {isPlaying ? (
               <span className="text-[8px] font-black text-tint animate-pulse uppercase tracking-widest">Active Playing</span>
             ) : (
               <span className="text-[8px] font-bold text-secondary opacity-30 uppercase tracking-[0.2em]">
                 {sfx.source} • {sfx.tags[0] || 'Uncategorized'}
               </span>
             )}
          </div>
        </div>
      </div>

      {/* Hover Action */}
      <div className="absolute inset-0 bg-tint/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}

export default SFXCard
