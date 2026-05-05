import React, { useState, useEffect } from 'react'
import { PlaylistItem } from '../types'
import { useSoundStore } from '../store/useSoundStore'
import { audioService } from '../services/audio.service'
import { Pencil, Trash2 } from 'lucide-react'
import EditSFXModal from './EditSFXModal'

interface PlaylistSFXItemProps {
  item: PlaylistItem
  playlistId: string
  onDelete: () => void
}

const PlaylistSFXItem: React.FC<PlaylistSFXItemProps> = ({ item, playlistId, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const updatePlaylist = useSoundStore((state) => state.updatePlaylist)
  const playlists = useSoundStore((state) => state.playlists)
  const sounds = useSoundStore((state) => state.sounds)
  const isHotkeyEnabled = useSoundStore((state) => state.isHotkeyEnabled)

  useEffect(() => {
    const handlePlayed = (e: any) => {
      const { sfxId, playlistId: playedPlaylistId } = e.detail
      if (sfxId === item.rootId && playedPlaylistId === playlistId) {
        setIsActive(true)
        setTimeout(() => setIsActive(false), 1000)
      }
    }
    window.addEventListener('sfx-played', handlePlayed)
    return () => window.removeEventListener('sfx-played', handlePlayed)
  }, [item.rootId, playlistId])

  const handlePlay = () => {
    const sfx = sounds.find(s => s.id === item.rootId)
    const pl = playlists.find(p => p.id === playlistId)
    if (sfx && pl) {
      const finalVolume = (item.volume / 100) * (pl.masterVolume / 100) * 100
      audioService.play(sfx, pl.id, finalVolume)
    }
  }

  const handleUpdate = async (updates: Partial<PlaylistItem>) => {
    const pl = playlists.find(p => p.id === playlistId)
    if (pl) {
      const newItems = pl.items.map(i => i.id === item.id ? { ...i, ...updates } : i)
      await updatePlaylist({ ...pl, items: newItems })
    }
    setIsEditing(false)
  }

  return (
    <>
      <div 
        onClick={handlePlay}
        className={`
          group relative aspect-square rounded-[40px] bg-white/[0.02] border border-white/5 p-6 transition-all duration-300
          hover:-translate-y-2 hover:border-tint/40 cursor-pointer overflow-hidden shadow-xl
          ${isActive ? 'border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.2)] ring-4 ring-emerald-400/20' : ''}
        `}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-tint/5 to-sky-500/5 opacity-50 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4">
          <div className={`
             h-16 w-16 rounded-[24px] bg-black/40 border border-white/5 flex items-center justify-center text-xl font-black text-tint shadow-inner transition-transform duration-500
             ${isActive ? 'scale-125 rotate-12' : 'group-hover:scale-110'}
          `}>
            {item.hotkey ? (
              <span className="tabular-nums">{item.hotkey.split('+').pop()}</span>
            ) : (
              <span className="opacity-20">🔊</span>
            )}
          </div>

          <div className="text-center w-full space-y-2 px-2">
            <p className="text-xs sm:text-sm font-black text-white truncate uppercase tracking-tight">
               {item.customName || item.rootName}
            </p>
            
            <div className="flex items-center gap-2 justify-center">
               <div className="w-16 h-1 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${item.volume}%` }}
                  />
               </div>
               <span className="text-[9px] font-black text-tint tabular-nums">{item.volume}%</span>
            </div>
          </div>
        </div>

        {/* Action Overlay */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0 z-20">
           <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="h-9 w-9 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-tint hover:text-zinc-950 transition-all shadow-lg"
           >
             <Pencil size={14} />
           </button>
           <button 
            onClick={(e) => { e.stopPropagation(); if(confirm('Remove sound?')) onDelete(); }}
            className="h-9 w-9 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
           >
             <Trash2 size={14} />
           </button>
        </div>
      </div>

      {isEditing && (
        <EditSFXModal 
          item={item}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdate}
        />
      )}
    </>
  )
}

export default PlaylistSFXItem
