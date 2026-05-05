import React, { useState } from 'react'
import { useSoundStore } from '../store/useSoundStore'
import { audioService } from '../services/audio.service'
import { Playlist, PlaylistItem } from '../types'
import AddSFXModal from './AddSFXModal'
import CreatePlaylistModal from './CreatePlaylistModal'

const PlaylistCard: React.FC<{ 
  playlist: Playlist, 
  onOpen: () => void, 
  onDelete: () => void
}> = ({ playlist, onOpen, onDelete }) => {
  const t = useSoundStore(state => state.translations)
  
  return (
    <div 
      onClick={onOpen}
      className="group relative rounded-[40px] sm:rounded-[48px] bg-white/[0.02] border border-white/5 p-6 sm:p-10 transition-all hover:border-tint/40 cursor-pointer overflow-hidden shadow-2xl hover:-translate-y-2"
    >
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="flex items-center justify-between">
          <div className="h-14 w-14 sm:h-20 sm:w-20 flex items-center justify-center rounded-2xl sm:rounded-[28px] bg-black/40 text-3xl sm:text-5xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 text-primary/40">
            🎵
          </div>
          <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all lg:translate-x-10 lg:group-hover:translate-x-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl sm:rounded-2xl bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
              title="Delete Board"
            >
              🗑️
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight truncate mb-2 sm:mb-3">{playlist.name}</h3>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/5 text-[9px] sm:text-[10px] font-black text-secondary uppercase tracking-widest">{playlist.items.length} {t.playlist?.items}</span>
            <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-tint opacity-20"></div>
            <span className="text-[9px] sm:text-[10px] font-black text-tint uppercase tracking-widest">{playlist.masterVolume}% VOL</span>
          </div>
        </div>

        {/* Quick Items Preview */}
        <div className="flex flex-col gap-1.5 sm:gap-2 mt-1 sm:mt-2">
           {playlist.items.slice(0, 3).map(item => (
             <div key={item.id} className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-secondary opacity-30 group-hover:opacity-60 transition-opacity">
                <span className="truncate pr-4 flex-1">● {item.customName || item.rootName}</span>
                <span className="tabular-nums bg-white/5 px-2 py-0.5 rounded-lg">{item.hotkey || '—'}</span>
             </div>
           ))}
           {playlist.items.length > 3 && <span className="text-[8px] sm:text-[9px] font-black text-tint opacity-20 mt-1 uppercase tracking-widest">+ {playlist.items.length - 3} more sounds</span>}
        </div>
      </div>
    </div>
  )
}

const PlaylistTab: React.FC = () => {
  const playlists = useSoundStore((state) => state.playlists)
  const sounds = useSoundStore((state) => state.sounds)
  const createNewPlaylist = useSoundStore((state) => state.createNewPlaylist)
  const removePlaylist = useSoundStore((state) => state.removePlaylist)
  const updatePlaylist = useSoundStore((state) => state.updatePlaylist)
  const t = useSoundStore((state) => state.translations)
  
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [renamingPlaylist, setRenamingPlaylist] = useState<Playlist | null>(null)

  const handleCreate = (name: string) => {
    createNewPlaylist(name)
    setShowCreateModal(false)
  }

  const handleRename = (name: string) => {
    if (renamingPlaylist) {
      updatePlaylist({ ...renamingPlaylist, name })
      setRenamingPlaylist(null)
    }
  }

  const handlePlay = (item: PlaylistItem) => {
    const sfx = sounds.find(s => s.id === item.rootId)
    const pl = playlists.find(p => p.id === editingPlaylist?.id)
    if (sfx && pl) {
      const finalVolume = (item.volume / 100) * (pl.masterVolume / 100) * 100
      audioService.play(sfx, pl.id, finalVolume)
    }
  }

  const handleUpdateVolume = async (item: PlaylistItem, vol: number) => {
    if (!editingPlaylist) return
    const newItems = editingPlaylist.items.map(i => i.id === item.id ? { ...i, volume: vol } : i)
    await updatePlaylist({ ...editingPlaylist, items: newItems })
  }

  const handleUpdateMasterVolume = async (vol: number) => {
    if (!editingPlaylist) return
    await updatePlaylist({ ...editingPlaylist, masterVolume: vol })
  }

  const handleOpenPlaylist = (pl: Playlist) => {
    setEditingPlaylist(pl)
  }

  if (editingPlaylist) {
    const pl = playlists.find(p => p.id === editingPlaylist.id) || editingPlaylist

    return (
      <div className="flex h-full flex-col gap-6 sm:gap-8 animate-scale-in">
        {/* Header bar for active playlist */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6 sm:p-8 bg-black/40 rounded-[32px] sm:rounded-[48px] border border-white/5 shadow-2xl gap-6 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-8">
            <button onClick={() => setEditingPlaylist(null)} className="h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center rounded-xl sm:rounded-[24px] bg-white/5 text-secondary hover:text-white transition-all text-xl sm:text-2xl shadow-xl">←</button>
            <div>
              <div className="flex items-center gap-3 sm:gap-4">
                  <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white truncate max-w-[150px] sm:max-w-none">{pl.name}</h2>
                  <button onClick={() => setRenamingPlaylist(pl)} className="text-tint opacity-30 hover:opacity-100 transition-all text-sm">✎</button>
              </div>
              <p className="text-[9px] sm:text-[11px] font-black text-secondary opacity-30 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">{pl.items.length} SOUNDS CONFIGURED</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 sm:gap-12">
            <div className="flex items-center gap-4 sm:gap-8 md:px-12 md:border-x border-white/5">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] sm:text-[10px] font-black text-secondary opacity-30 uppercase tracking-widest">{t.playlist?.masterVolume}</span>
                <span className="text-base sm:text-lg font-black text-tint tabular-nums">{pl.masterVolume}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={pl.masterVolume} 
                onChange={(e) => handleUpdateMasterVolume(parseInt(e.target.value))}
                className="w-full md:w-56 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-tint"
              />
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-4 sm:px-10 sm:py-4.5 rounded-2xl sm:rounded-[24px] bg-gradient-to-r from-tint to-sky-600 text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-widest sm:tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {t.playlist?.addSounds || '+ CONFIGURE BOARD'}
            </button>
          </div>
        </div>

        {/* SFX Grid for active playlist */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-8 pb-12 pr-2">
            {pl.items.map(item => {
              const sfx = sounds.find(s => s.id === item.rootId)
              return (
                <div key={item.id} className="group relative rounded-[32px] sm:rounded-[44px] bg-white/[0.02] border border-white/5 p-6 sm:p-8 transition-all hover:border-tint/40 shadow-xl hover:-translate-y-2 overflow-hidden">
                  <div className="flex h-full flex-col gap-6 sm:gap-8">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center rounded-[18px] sm:rounded-[24px] bg-black/40 text-2xl sm:text-4xl cursor-pointer hover:scale-110 active:scale-90 transition-all border border-white/5 shadow-inner" onClick={() => handlePlay(item)}>
                        🔊
                      </div>
                      <div className="flex flex-col items-end gap-1.5 sm:gap-2">
                         <span className="text-[8px] sm:text-[9px] font-black text-secondary opacity-30 uppercase tracking-widest">{t.playlist?.hotkey}</span>
                         <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-black/60 text-[9px] sm:text-[10px] font-black text-tint border border-tint/30 shadow-lg tabular-nums">
                           {item.hotkey || 'UNSET'}
                         </span>
                      </div>
                    </div>
                    
                    <div className="w-full relative px-1">
                      <div className="flex items-center justify-between group/name">
                          <p className="text-base sm:text-lg font-black text-white truncate uppercase tracking-tight pr-4 flex-1">{item.customName || item.rootName}</p>
                          <button onClick={() => {
                             const n = window.prompt('Custom name:', item.customName || item.rootName)
                             if (n) {
                               const newItems = pl.items.map(i => i.id === item.id ? {...i, customName: n} : i)
                               updatePlaylist({...pl, items: newItems})
                             }
                          }} className="opacity-0 group-hover/name:opacity-100 text-tint transition-all text-sm">✎</button>
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-secondary opacity-20 truncate italic mt-1 uppercase tracking-tighter">Original: {item.rootName}</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:gap-3 mt-auto pt-4 sm:pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] sm:text-[10px] font-black text-secondary opacity-30 uppercase tracking-widest">{t.playlist?.volume}</span>
                        <span className="text-[10px] sm:text-[11px] font-black text-tint tabular-nums">{item.volume}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={item.volume} 
                        onChange={(e) => handleUpdateVolume(item, parseInt(e.target.value))}
                        className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-tint"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={async (e) => {
                       e.stopPropagation();
                       if (confirm('Remove from board?')) {
                         const newItems = pl.items.filter(i => i.id !== item.id)
                         updatePlaylist({...pl, items: newItems})
                       }
                    }}
                    className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-500 text-white flex items-center justify-center text-sm sm:text-xl opacity-100 lg:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90 transition-all shadow-2xl z-10 border-4 sm:border-[6px] border-zinc-950"
                  >
                    ×
                  </button>
                </div>
              )
            })}
            {pl.items.length === 0 && (
                <div className="col-span-full h-80 sm:h-96 flex flex-col items-center justify-center bg-black/10 rounded-[48px] sm:rounded-[64px] border border-dashed border-white/5 gap-6 sm:gap-8 animate-pulse">
                   <div className="text-6xl sm:text-8xl opacity-10">🍱</div>
                   <div className="text-center">
                       <p className="text-secondary opacity-40 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-sm sm:text-lg">Your board is empty</p>
                       <button onClick={() => setShowAddModal(true)} className="text-[10px] sm:text-[11px] font-black text-tint uppercase tracking-widest sm:tracking-[0.2em] mt-6 sm:mt-8 px-8 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl bg-tint/5 border border-tint/20 hover:bg-tint hover:text-black transition-all shadow-2xl">Initialize Board</button>
                   </div>
                </div>
            )}
          </div>
        </div>

        {showAddModal && <AddSFXModal playlist={pl} onClose={() => setShowAddModal(false)} />}
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 sm:gap-10">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white"><span className="text-tint">PRO</span> SOUNDBOARDS</h2>
            <p className="text-[9px] sm:text-[11px] font-bold text-secondary opacity-40 uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-1 sm:mt-2">Create performance-ready custom boards</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-8 py-4 sm:px-10 sm:py-5 rounded-[18px] sm:rounded-[24px] bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] text-secondary hover:text-tint hover:border-tint/40 transition-all shadow-2xl active:scale-95"
        >
          {t.playlist?.new || '+ NEW BOARD'}
        </button>
      </div>

      {/* Grid of Playlists */}
      {playlists.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="group relative flex flex-col items-center gap-6 sm:gap-10 p-12 sm:p-24 rounded-[48px] sm:rounded-[80px] border border-dashed border-white/10 hover:border-tint/50 transition-all bg-black/10 w-full max-w-2xl"
            >
              <div className="text-8xl sm:text-[120px] group-hover:scale-110 transition-all duration-700 group-hover:rotate-12">🍱</div>
              <div className="text-center space-y-3 sm:space-y-4">
                  <p className="text-secondary font-black uppercase tracking-widest sm:tracking-[0.4em] text-xl sm:text-2xl opacity-60">No boards active</p>
                  <p className="text-secondary opacity-20 text-xs sm:text-sm font-bold uppercase tracking-widest">Construct your first professional layout</p>
              </div>
              <span className="text-[10px] sm:text-[11px] font-black text-tint uppercase tracking-[0.3em] sm:tracking-[0.4em] animate-pulse-subtle bg-tint/5 px-8 py-3 sm:px-10 sm:py-4 rounded-full border border-tint/20">Click to start</span>
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-10 pb-12 overflow-y-auto custom-scrollbar pr-2">
          {playlists.map((pl) => (
            <PlaylistCard 
              key={pl.id}
              playlist={pl}
              onOpen={() => handleOpenPlaylist(pl)}
              onDelete={() => { if(confirm('Wipe board?')) removePlaylist(pl.id); }}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreatePlaylistModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreate} 
        />
      )}

      {renamingPlaylist && (
        <CreatePlaylistModal 
          initialName={renamingPlaylist.name}
          onClose={() => setRenamingPlaylist(null)} 
          onSave={handleRename} 
        />
      )}
    </div>
  )
}

export default PlaylistTab
