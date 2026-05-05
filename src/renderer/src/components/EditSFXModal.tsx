import React, { useState, useEffect } from 'react'
import { PlaylistItem } from '../types'
import { useSoundStore } from '../store/useSoundStore'
import { audioService } from '../services/audio.service'

interface EditSFXModalProps {
  item: PlaylistItem
  onSave: (updates: Partial<PlaylistItem>) => void
  onClose: () => void
}

const EditSFXModal: React.FC<EditSFXModalProps> = ({ item, onSave, onClose }) => {
  const [customName, setCustomName] = useState(item.customName || '')
  const [hotkey, setHotkey] = useState(item.hotkey || '')
  const [volume, setVolume] = useState(item.volume)
  const [isRecording, setIsRecording] = useState(false)
  const t = useSoundStore((state) => state.translations)

  useEffect(() => {
    if (!isRecording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return

      let combo = ''
      if (e.ctrlKey) combo += 'Ctrl+'
      if (e.altKey) combo += 'Alt+'
      if (e.shiftKey) combo += 'Shift+'
      
      const keyName = e.code.replace('Key', '').replace('Digit', '')
      combo += keyName

      setHotkey(combo)
      setIsRecording(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRecording])

  const handlePreview = () => {
    const sfx = useSoundStore.getState().sounds.find(s => s.id === item.rootId)
    if (sfx) audioService.play(sfx)
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
      <div className="flex w-full max-w-lg flex-col rounded-[48px] bg-zinc-900 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-black/20 flex flex-col items-center text-center">
          <div className="h-20 w-20 flex items-center justify-center rounded-[32px] bg-tint/10 text-tint text-4xl mb-4 shadow-[0_0_40px_rgba(0,217,255,0.1)]">
             ⚙️
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">CONFIGURE SOUND</h2>
          <p className="text-[10px] font-bold text-secondary opacity-40 uppercase tracking-[0.3em] mt-2">Fine-tune individual SFX settings</p>
        </div>

        {/* Content */}
        <div className="p-10 space-y-8">
           {/* Preview Card */}
           <div className="flex items-center gap-6 p-6 bg-black/40 rounded-[32px] border border-white/5 shadow-inner group">
              <button 
                onClick={handlePreview}
                className="h-14 w-14 flex items-center justify-center rounded-[22px] bg-tint text-zinc-950 text-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
              >
                ▶
              </button>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-black text-secondary opacity-30 uppercase tracking-widest mb-1">Source Sound</p>
                 <p className="text-lg font-black text-white truncate uppercase">{item.rootName}</p>
              </div>
           </div>

           {/* Input Fields */}
           <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-50 px-2">Display Name</label>
                 <input 
                   type="text" 
                   value={customName}
                   onChange={e => setCustomName(e.target.value)}
                   placeholder={item.rootName}
                   className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black uppercase text-white focus:border-tint/50 transition-all shadow-inner"
                 />
              </div>

              <div className="flex flex-col gap-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-50 px-2">Hotkey Shortcut</label>
                 <button 
                   onClick={() => setIsRecording(!isRecording)}
                   className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all ${isRecording ? 'bg-tint text-zinc-950 border-tint shadow-lg' : 'bg-black/40 text-tint border-white/10 hover:border-tint/30'}`}
                 >
                   {isRecording ? 'LISTENING...' : (hotkey || 'PRESS TO RECORD')}
                 </button>
              </div>

              <div className="flex flex-col gap-3">
                 <div className="flex justify-between px-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-50">Individual Volume</label>
                    <span className="text-sm font-black text-tint">{volume}%</span>
                 </div>
                 <input 
                   type="range" min="0" max="100" value={volume}
                   onChange={e => setVolume(+e.target.value)}
                   className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-tint mt-2"
                 />
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-5 rounded-[24px] hover:bg-white/5 font-black uppercase text-[11px] tracking-[0.2em] text-secondary transition-all"
          >
            {t.common?.cancel}
          </button>
          <button 
            onClick={() => onSave({ customName, hotkey, volume })}
            className="flex-[2] py-5 rounded-[24px] bg-gradient-to-r from-tint to-sky-600 text-zinc-950 font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_15px_40px_rgba(0,217,255,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            {t.common?.save || 'CONFIRM UPDATES'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditSFXModal
