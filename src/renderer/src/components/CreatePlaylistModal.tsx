import React, { useState } from 'react'
import { useSoundStore } from '../store/useSoundStore'

interface CreatePlaylistModalProps {
  onClose: () => void
  onSave: (name: string) => void
  initialName?: string
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onClose, onSave, initialName = '' }) => {
  const [name, setName] = useState(initialName)
  const t = useSoundStore((state) => state.translations)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim())
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
      <form 
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col rounded-[40px] bg-zinc-900 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in"
      >
        <div className="p-10 border-b border-white/5 bg-black/20 flex flex-col items-center text-center">
          <div className="h-20 w-20 flex items-center justify-center rounded-[32px] bg-tint/10 text-tint text-4xl mb-6 shadow-[0_0_40px_rgba(0,217,255,0.1)]">
             {initialName ? '✎' : '🍱'}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            {initialName ? 'RENAME BOARD' : 'INITIALIZE NEW BOARD'}
          </h2>
          <p className="text-[10px] font-bold text-secondary opacity-40 uppercase tracking-[0.3em] mt-2">
            Set a unique identity for your soundboard
          </p>
        </div>

        <div className="p-10">
          <div className="flex flex-col gap-3">
             <label className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary opacity-50 px-2">Board Name</label>
             <input 
               autoFocus
               type="text" 
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Enter name..."
               className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-5 text-lg font-black uppercase text-white focus:border-tint/50 transition-all shadow-inner placeholder:text-white/5"
             />
          </div>
        </div>

        <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-5 rounded-[24px] hover:bg-white/5 font-black uppercase text-[11px] tracking-[0.2em] text-secondary transition-all"
          >
            {t.common?.cancel}
          </button>
          <button 
            type="submit"
            disabled={!name.trim()}
            className="flex-[2] py-5 rounded-[24px] bg-gradient-to-r from-tint to-sky-600 text-zinc-950 font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_15px_40px_rgba(0,217,255,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
          >
            {t.common?.save || 'CONFIRM'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePlaylistModal
