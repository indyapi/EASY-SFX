import React, { useState, useEffect, useMemo } from 'react'
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
  const [recordingId, setRecordingId] = useState<string | 'bulk' | null>(null)
  
  // Selected items with their configuration
  const [selectedItems, setSelectedItems] = useState<Map<string, { customName: string, hotkey: string, volume: number }>>(
    new Map(playlist.items.map(i => [i.rootId, { customName: i.customName || '', hotkey: i.hotkey, volume: i.volume }]))
  )

  // Bulk Edit State
  const [bulkEdit, setBulkEdit] = useState({ name: '', hotkey: '', volume: 100 })

  const filteredSounds = useMemo(() => sounds.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  ), [sounds, search])

  // Hotkey Recorder
  useEffect(() => {
    if (!recordingId) return

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

      if (recordingId === 'bulk') {
        setBulkEdit(prev => ({ ...prev, hotkey: combo }))
      } else {
        handleUpdateItem(recordingId, { hotkey: combo })
      }
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

  const applyBulkEdit = () => {
    const newSelected = new Map(selectedItems)
    newSelected.forEach((val, key) => {
      newSelected.set(key, {
        customName: bulkEdit.name || val.customName,
        hotkey: bulkEdit.hotkey || val.hotkey,
        volume: bulkEdit.volume
      })
    })
    setSelectedItems(newSelected)
  }

  const handleSave = async () => {
    const newItems: PlaylistItem[] = Array.from(selectedItems.entries()).map(([rootId, data]) => {
      const sfx = sounds.find(s => s.id === rootId)!
      return {
        id: playlist.items.find(i => i.rootId === rootId)?.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rootId,
        rootName: sfx.name,
        filePath: sfx.filePath,
        ...data
      }
    })
    await updatePlaylist({ ...playlist, items: newItems })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-6">
      <div className="flex h-full sm:h-[92vh] w-full max-w-7xl flex-col rounded-none sm:rounded-[48px] bg-zinc-950 border-none sm:border border-white/10 shadow-none sm:shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8 border-b border-white/5 bg-black/20 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2 sm:gap-4">
               <span className="text-tint">ADD TO</span> <span className="truncate max-w-[150px] sm:max-w-none">{playlist.name}</span>
            </h2>
            <p className="hidden sm:block text-[11px] font-bold text-secondary opacity-40 uppercase tracking-[0.3em] mt-2">Pick, preview, and configure hotkeys for your board</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center rounded-xl sm:rounded-[24px] bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all text-2xl sm:text-3xl font-light">×</button>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Left: Library Browser */}
          <div className="flex w-full lg:w-[420px] flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-black/10 h-1/2 lg:h-auto">
            <div className="p-6 sm:p-8 space-y-4">
              <div className="relative group">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.library?.search || "Search library..."} 
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-3.5 text-sm focus:outline-none focus:border-tint/50 text-white transition-all shadow-inner"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">🔍</span>
              </div>
              <p className="text-[10px] font-black text-secondary opacity-30 uppercase tracking-widest px-1">Found {filteredSounds.length} sounds</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                {filteredSounds.map(sfx => {
                  const isSelected = selectedItems.has(sfx.id)
                  return (
                    <div 
                      key={sfx.id} 
                      onClick={() => handleToggle(sfx)}
                      className={`
                        group relative flex items-center justify-between p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] cursor-pointer transition-all border
                        ${isSelected 
                           ? 'border-tint/40 bg-tint/10 shadow-[0_10px_30px_rgba(0,217,255,0.1)]' 
                           : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20'}
                      `}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <button 
                          onClick={(e) => { e.stopPropagation(); audioService.play(sfx); }}
                          className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-[16px] sm:rounded-[18px] bg-black/40 text-lg sm:text-xl hover:scale-110 active:scale-90 transition-all shadow-lg border border-white/5"
                        >
                          ▶
                        </button>
                        <div className="flex flex-col overflow-hidden">
                           <span className="text-xs sm:text-[13px] font-black uppercase tracking-tight truncate text-primary/90">{sfx.name}</span>
                           <span className="text-[8px] sm:text-[9px] font-bold text-secondary opacity-30 uppercase tracking-widest mt-0.5">{sfx.source}</span>
                        </div>
                      </div>
                      <div className={`h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-tint border-tint text-black scale-110 rotate-[360deg]' : 'border-white/10 opacity-30'}`}>
                        {isSelected && <span className="text-[10px] sm:text-xs font-black italic">✓</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Board Config */}
          <div className="flex-1 flex flex-col bg-black/20 relative h-1/2 lg:h-auto overflow-hidden">
            
            {/* Bulk Edit Toolset */}
            {selectedItems.size > 0 && (
              <div className="mx-4 sm:mx-10 mt-6 sm:mt-8 p-6 sm:p-8 rounded-[32px] sm:rounded-[36px] bg-tint/5 border border-tint/20 shadow-2xl shrink-0">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl sm:rounded-2xl bg-tint/20 text-tint text-lg sm:text-xl">⚡</div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-tint">Bulk Apply</h4>
                        <p className="text-[9px] sm:text-[10px] font-bold text-secondary opacity-50 uppercase tracking-widest">Update {selectedItems.size} items</p>
                      </div>
                   </div>
                   <button 
                    onClick={applyBulkEdit}
                    className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl sm:rounded-2xl bg-tint text-zinc-950 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                   >
                     Apply
                   </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-secondary opacity-50 px-1">Shared Name</label>
                      <input 
                        type="text" 
                        value={bulkEdit.name}
                        onChange={e => setBulkEdit({...bulkEdit, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-white focus:border-tint/40 transition-all"
                        placeholder="Name..."
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-secondary opacity-50 px-1">Shared Hotkey</label>
                      <button 
                        onClick={() => setRecordingId(recordingId === 'bulk' ? null : 'bulk')}
                        className={`w-full h-[38px] rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${recordingId === 'bulk' ? 'bg-tint text-black border-tint' : 'bg-black/40 text-tint border-white/10'}`}
                      >
                        {recordingId === 'bulk' ? 'RECORD...' : (bulkEdit.hotkey || 'SET KEY')}
                      </button>
                   </div>
                   <div className="space-y-2 col-span-full sm:col-span-1">
                      <div className="flex justify-between px-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-secondary opacity-50">Volume</label>
                        <span className="text-[11px] font-black text-tint">{bulkEdit.volume}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={bulkEdit.volume}
                        onChange={e => setBulkEdit({...bulkEdit, volume: +e.target.value})}
                        className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-tint mt-2"
                      />
                   </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-8 pb-10">
                {Array.from(selectedItems.entries()).map(([rootId, data]) => {
                  const sfx = sounds.find(s => s.id === rootId)
                  const isRecording = recordingId === rootId
                  return (
                    <div key={rootId} className="group/item relative flex flex-col gap-4 sm:gap-6 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] bg-white/[0.02] border border-white/5 shadow-2xl hover:border-tint/30 transition-all">
                      <div className="flex items-start justify-between">
                         <div className="flex flex-col gap-1.5 flex-1 pr-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-secondary opacity-25 truncate">SFX: {sfx?.name}</span>
                            <input 
                              type="text" 
                              value={data.customName}
                              onChange={(e) => handleUpdateItem(rootId, { customName: e.target.value })}
                              className="w-full bg-transparent border-none p-0 text-lg sm:text-xl font-black uppercase text-primary focus:ring-0 focus:text-tint transition-all"
                              placeholder="Board Name..."
                            />
                         </div>
                         <div className="flex flex-col items-end gap-2 shrink-0">
                             <span className="text-[8px] font-black uppercase tracking-widest text-secondary opacity-40">Hotkey</span>
                             <button
                                onClick={() => setRecordingId(isRecording ? null : rootId)}
                                className={`
                                    min-w-[90px] sm:min-w-[110px] h-9 sm:h-10 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border
                                    ${isRecording ? 'bg-tint text-black border-tint' : 'bg-black/40 text-tint border-tint/20'}
                                `}
                              >
                                {isRecording ? 'LISTEN' : (data.hotkey || 'SET')}
                              </button>
                         </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-secondary opacity-30">Volume</label>
                          <span className="text-[11px] font-black text-tint">{data.volume}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={data.volume}
                          onChange={(e) => handleUpdateItem(rootId, { volume: parseInt(e.target.value) })}
                          className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-tint"
                        />
                      </div>
                      
                      <button 
                        onClick={() => handleToggle(sfx!)}
                        className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-500 text-white opacity-100 lg:opacity-0 group-hover/item:opacity-100 transition-all text-lg flex items-center justify-center shadow-xl border-4 sm:border-8 border-zinc-950"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
              
              {selectedItems.size === 0 && (
                <div className="h-full flex flex-col items-center justify-center gap-6 animate-pulse p-10">
                   <div className="text-6xl sm:text-[100px] opacity-10">🍱</div>
                   <div className="text-center space-y-2">
                       <p className="text-xl font-black uppercase tracking-widest text-secondary opacity-20">Board Empty</p>
                       <p className="text-xs font-bold text-secondary opacity-10 uppercase tracking-widest">Select sounds from the left to start configuring</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-10 sm:px-12 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
             <div className="flex -space-x-3 sm:-space-x-4">
                {Array.from(selectedItems.keys()).slice(0, 3).map((id, i) => (
                   <div key={id} style={{ zIndex: 10 - i }} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-[18px] bg-zinc-900 border-4 border-zinc-950 flex items-center justify-center text-lg shadow-2xl">🔊</div>
                ))}
                {selectedItems.size > 3 && <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-[18px] bg-tint border-4 border-zinc-950 flex items-center justify-center text-zinc-950 font-black text-[10px] z-0 shadow-2xl">+{selectedItems.size - 3}</div>}
             </div>
             <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black text-white">{selectedItems.size} <span className="text-tint">SFX</span></span>
                <span className="text-[9px] sm:text-[10px] font-black text-secondary uppercase tracking-widest opacity-40">Ready for board</span>
             </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-[24px] hover:bg-white/5 font-black uppercase text-[10px] sm:text-[11px] tracking-widest text-secondary transition-all"
            >
              {t.common?.cancel}
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] sm:flex-none px-10 sm:px-20 py-4 sm:py-5 rounded-2xl sm:rounded-[24px] bg-gradient-to-r from-tint to-sky-600 text-zinc-950 shadow-xl disabled:opacity-10 transition-all font-black uppercase text-[10px] sm:text-[11px] tracking-widest hover:scale-105 active:scale-95"
              disabled={selectedItems.size === 0}
            >
              {t.common?.save || 'SAVE BOARD'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddSFXModal
