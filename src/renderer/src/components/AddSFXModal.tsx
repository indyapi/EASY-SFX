import React, { useState, useEffect } from 'react'
import { useSoundStore } from '../store/useSoundStore'
import { audioService } from '../services/audio.service'
import { SFX, Playlist, PlaylistItem } from '../types'

interface AddSFXModalProps {
  playlist: Playlist
  onClose: () => void
}

const AddSFXModal: React.FC<AddSFXModalProps> = ({ playlist, onClose }) => {
  const sounds = useSoundStore((state) => state.sounds)
  const updatePlaylist = useSoundStore((state) => state.updatePlaylist)
  const t = useSoundStore((state) => state.translations)
  
  const [search, setSearch] = useState('')
  const [recordingId, setRecordingId] = useState<string | null>(null)
  
  const [selectedItems, setSelectedItems] = useState<Map<string, { customName: string, hotkey: string, volume: number }>>(
    new Map(playlist.items.map(i => [i.rootId, { customName: i.customName, hotkey: i.hotkey, volume: i.volume }]))
  )

  const filteredSounds = sounds.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  // Hotkey Recorder Effect
  useEffect(() => {
    if (!recordingId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Ignore modifier keys as primary keys for now or combine them
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return

      let combo = ''
      if (e.ctrlKey) combo += 'Ctrl+'
      if (e.altKey) combo += 'Alt+'
      if (e.shiftKey) combo += 'Shift+'
      
      // Use code for VK-like behavior, but map to pretty names
      const keyName = e.code.replace('Key', '').replace('Digit', '')
      combo += keyName

      handleUpdateItem(recordingId, { hotkey: combo })
      setRecordingId(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [recordingId])

  const handleToggle = (sfx: SFX) => {
    const newSelected = new Map(selectedItems)
    if (newSelected.has(sfx.id)) {
      newSelected.delete(sfx.id)
    } else {
      newSelected.set(sfx.id, { customName: sfx.name, hotkey: '', volume: 100 })
    }
    setSelectedItems(newSelected)
  }

  const handleUpdateItem = (rootId: string, updates: Partial<{ customName: string, hotkey: string, volume: number }>) => {
    const newSelected = new Map(selectedItems)
    const current = newSelected.get(rootId)
    if (current) {
      newSelected.set(rootId, { ...current, ...updates })
      setSelectedItems(newSelected)
    }
  }

  const handleSave = async () => {
    const newItems: PlaylistItem[] = Array.from(selectedItems.entries()).map(([rootId, data]) => ({
      id: playlist.items.find(i => i.rootId === rootId)?.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rootId,
      ...data
    }))
    await updatePlaylist({ ...playlist, items: newItems })
    onClose()
  }

  const handleTestSound = (e: React.MouseEvent, sfx: SFX) => {
    e.stopPropagation()
    audioService.play(sfx)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-[40px] card-bg border border-white/5 shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-8 border-b nav-bg">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary">Manage Playlist: {playlist.name}</h2>
            <p className="text-[10px] font-bold text-secondary opacity-40 uppercase tracking-widest mt-1">Select and configure your sounds</p>
          </div>
          <button onClick={onClose} className="h-12 w-12 flex items-center justify-center rounded-2xl hover:bg-white/5 text-2xl transition-colors">×</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Sound List */}
          <div className="flex w-[380px] flex-col border-r border-white/5 bg-black/10">
            <div className="p-6 border-b nav-bg">
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.library?.search} 
                  className="w-full rounded-2xl bg-black/20 border border-white/5 px-5 py-3 text-sm focus:outline-none focus:border-tint/50 text-primary transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {filteredSounds.map(sfx => {
                const isSelected = selectedItems.has(sfx.id)
                return (
                  <div 
                    key={sfx.id} 
                    onClick={() => handleToggle(sfx)}
                    className={`
                      flex items-center justify-between p-4 mb-2 rounded-3xl cursor-pointer transition-all border
                      ${isSelected ? 'border-tint bg-tint/10 shadow-lg shadow-tint/10 translate-x-1' : 'border-transparent hover:bg-white/5'}
                    `}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <button 
                        onClick={(e) => handleTestSound(e, sfx)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-black/30 text-xl hover:scale-110 active:scale-90 transition-transform"
                      >
                        🔊
                      </button>
                      <div className="flex flex-col overflow-hidden">
                         <span className="text-xs font-black uppercase tracking-tight truncate text-primary">{sfx.name}</span>
                         <span className="text-[8px] font-bold text-secondary opacity-40 uppercase">Original SFX</span>
                      </div>
                    </div>
                    <div className={`h-6 w-6 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-tint border-tint text-black scale-110' : 'border-white/5 opacity-50'}`}>
                      {isSelected && <span className="text-xs font-black">✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Selected Configuration */}
          <div className="flex-1 flex flex-col bg-black/20">
            <div className="p-6 border-b nav-bg flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <span className="h-2 w-2 rounded-full bg-tint animate-pulse"></span>
                 <span className="text-xs font-black uppercase tracking-widest text-secondary">{selectedItems.size} {t.playlist?.items} in board</span>
              </div>
              {selectedItems.size > 0 && <button onClick={() => setSelectedItems(new Map())} className="text-[10px] font-black text-red-500 uppercase hover:underline tracking-widest">Remove all items</button>}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {Array.from(selectedItems.entries()).map(([rootId, data]) => {
                  const sfx = sounds.find(s => s.id === rootId)
                  const isRecording = recordingId === rootId
                  return (
                    <div key={rootId} className="flex flex-col gap-5 p-6 rounded-[32px] card-bg border border-white/5 shadow-xl hover:border-tint/20 transition-all group/item relative overflow-hidden">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 flex flex-col gap-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.1em] text-secondary opacity-30">{t.playlist?.customName}</label>
                          <input 
                            type="text" 
                            value={data.customName}
                            onChange={(e) => handleUpdateItem(rootId, { customName: e.target.value })}
                            className="bg-black/30 border-none rounded-2xl px-5 py-2.5 text-xs font-black uppercase text-primary focus:ring-2 focus:ring-tint/30 transition-all"
                          />
                        </div>
                        <div className="w-32 flex flex-col gap-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.1em] text-secondary opacity-30">{t.playlist?.hotkey}</label>
                          <button
                            onClick={() => setRecordingId(isRecording ? null : rootId)}
                            className={`
                                h-10 rounded-2xl font-black text-xs transition-all border
                                ${isRecording 
                                    ? 'bg-tint text-black border-tint animate-pulse' 
                                    : 'bg-black/30 text-tint border-white/5 hover:border-tint/50'}
                            `}
                          >
                            {isRecording ? 'PRESS KEY...' : (data.hotkey || 'SET KEY')}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black uppercase tracking-[0.1em] text-secondary opacity-30">{t.playlist?.volume}</label>
                          <span className="text-xs font-black text-tint">{data.volume}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="200" value={data.volume}
                          onChange={(e) => handleUpdateItem(rootId, { volume: parseInt(e.target.value) })}
                          className="w-full h-1 bg-black/30 rounded-lg appearance-none cursor-pointer accent-tint"
                        />
                      </div>
                      
                      <button 
                        onClick={() => handleToggle(sfx!)}
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500/10 text-red-500 opacity-0 group-hover/item:opacity-100 hover:bg-red-500 hover:text-white transition-all text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
              {selectedItems.size === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-secondary opacity-20 gap-6">
                   <div className="text-8xl">📦</div>
                   <div className="text-center">
                       <p className="text-lg font-black uppercase tracking-widest">Playlist Empty</p>
                       <p className="text-sm font-bold">Pick your sound effects from the left menu</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 nav-bg border-t border-white/5 flex justify-end gap-5">
          <button 
            onClick={onClose}
            className="px-10 py-4 rounded-2xl hover:bg-white/5 font-black uppercase text-xs tracking-[0.2em] text-secondary transition-all"
          >
            {t.common?.cancel}
          </button>
          <button 
            onClick={handleSave}
            className="px-16 py-4 rounded-2xl btn-tint shadow-2xl shadow-tint/30 disabled:opacity-20 disabled:grayscale transition-all font-black uppercase text-xs tracking-[0.2em]"
            disabled={selectedItems.size === 0}
          >
            {t.common?.save}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddSFXModal
