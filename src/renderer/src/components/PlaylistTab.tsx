import React, { useState } from 'react'
import { useSoundStore } from '../store/useSoundStore'
import { audioService } from '../services/audio.service'
import { Playlist, PlaylistItem } from '../types'
import AddSFXModal from './AddSFXModal'
import CreatePlaylistModal from './CreatePlaylistModal'
import PlaylistSFXItem from './PlaylistSFXItem'
import { useWindowSize } from '../hooks/useWindowSize'
import { useDynamicGrid } from '../hooks/useDynamicGrid'
import { useFullscreenSFX } from '../hooks/useFullscreenSFX'
import { useHotkeyToggle } from '../hooks/useHotkeyToggle'
import { Keyboard, Plus, ArrowLeft, Edit3, Trash2, Maximize2, Minimize2 } from 'lucide-react'

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
              <Trash2 size={16} />
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
  const { cols, setClampedCols, minCols, maxCols } = useDynamicGrid()
  const { isHotkeyEnabled } = useHotkeyToggle()
  const { isFullscreen, toggleFullscreen } = useFullscreenSFX()

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

  const handleUpdateMasterVolume = async (vol: number) => {
    if (!editingPlaylist) return
    await updatePlaylist({ ...editingPlaylist, masterVolume: vol })
  }

  const handleRemoveItem = async (itemId: string) => {
    if (editingPlaylist) {
       const newItems = editingPlaylist.items.filter(i => i.id !== itemId)
       await updatePlaylist({ ...editingPlaylist, items: newItems })
    }
  }

  const handleOpenPlaylist = (pl: Playlist) => {
    setEditingPlaylist(pl)
  }

  if (editingPlaylist) {
    const pl = playlists.find(p => p.id === editingPlaylist.id) || editingPlaylist

    return (
      <div className={`flex h-full w-full flex-col gap-6 sm:gap-8 overflow-hidden animate-scale-in ${isFullscreen ? 'sfx-grid-container' : ''}`}>
        {/* Hotkey Status Bar */}
        <div className="flex items-center gap-4 p-4 sm:p-5 bg-tint/5 rounded-[24px] border border-tint/20 shadow-[0_10px_30px_rgba(0,217,255,0.05)]">
           <div className={`h-3 w-3 rounded-full ${isHotkeyEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-secondary/30'}`}></div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-tint">
                 System Hotkeys {isHotkeyEnabled ? 'Active' : 'Paused'}
              </span>
              <p className="text-[9px] font-bold text-secondary opacity-40 uppercase tracking-widest mt-0.5">
                 Press <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-white mx-1 font-mono">HOME</kbd> to toggle global shortcuts
              </p>
           </div>
           <div className="ml-auto hidden sm:flex items-center gap-2">
              <Keyboard size={16} className="text-secondary opacity-20" />
           </div>
        </div>

        {/* Header bar for active playlist */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6 sm:p-8 bg-black/40 rounded-[32px] sm:rounded-[48px] border border-white/5 shadow-2xl gap-6 sm:gap-8 shrink-0">
          <div className="flex items-center gap-4 sm:gap-8">
            <button onClick={() => setEditingPlaylist(null)} className="h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center rounded-xl sm:rounded-[24px] bg-white/5 text-secondary hover:text-white transition-all text-xl sm:text-2xl shadow-xl border border-white/5 active:scale-95">
               <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3 sm:gap-4">
                  <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white truncate max-w-[150px] sm:max-w-none">{pl.name}</h2>
                  <button onClick={() => setRenamingPlaylist(pl)} className="text-tint opacity-30 hover:opacity-100 transition-all">
                     <Edit3 size={18} />
                  </button>
              </div>
              <p className="text-[9px] sm:text-[11px] font-black text-secondary opacity-30 uppercase tracking-widest sm:tracking-[0.3em] mt-1">{pl.items.length} SOUNDS CONFIGURED</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 sm:gap-10">
            <div className="flex items-center gap-6 sm:gap-10 md:px-10 md:border-x border-white/5">
              {/* Grid Control */}
              <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
                <span className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40 whitespace-nowrap">Grid:</span>
                <input 
                  type="range" min={minCols} max={maxCols} value={cols} 
                  onChange={(e) => setClampedCols(parseInt(e.target.value))}
                  className="w-24 h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-tint"
                />
                <span className="text-[10px] font-black text-tint tabular-nums w-4 text-center">{cols}</span>
              </div>

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
              className="px-6 py-4 sm:px-10 sm:py-4.5 rounded-2xl sm:rounded-[24px] bg-gradient-to-r from-tint to-sky-600 text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-widest sm:tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Plus size={16} strokeWidth={3} />
              {t.playlist?.addSounds || 'CONFIGURE BOARD'}
            </button>

            <button 
              onClick={toggleFullscreen}
              className={`
                h-11 w-11 flex items-center justify-center rounded-2xl transition-all shadow-lg active:scale-95 border
                ${isFullscreen ? 'bg-tint text-zinc-950 border-tint shadow-tint/20' : 'bg-white/5 text-secondary border-white/5 hover:bg-white/10'}
              `}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>

        {/* SFX Grid for active playlist */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div 
            className="grid gap-4 sm:gap-8 pb-12"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {pl.items.map(item => (
               <PlaylistSFXItem 
                key={item.id} 
                item={item} 
                playlistId={pl.id} 
                onDelete={() => handleRemoveItem(item.id)}
               />
            ))}
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
          className="px-8 py-4 sm:px-10 sm:py-5 rounded-[18px] sm:rounded-[24px] bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] text-secondary hover:text-tint hover:border-tint/40 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
        >
          <Plus size={16} strokeWidth={3} />
          {t.playlist?.new || 'NEW BOARD'}
        </button>
      </div>

      {/* Grid of Playlists */}
      {playlists.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="group relative flex flex-col items-center gap-6 sm:gap-10 p-12 sm:p-24 rounded-[48px] sm:rounded-[80px] border border-dashed border-white/10 hover:border-tint/50 transition-all bg-black/10 w-full max-w-2xl shadow-inner"
            >
              <div className="text-8xl sm:text-[120px] group-hover:scale-110 transition-all duration-700 group-hover:rotate-12">🍱</div>
              <div className="text-center space-y-3 sm:space-y-4">
                  <p className="text-secondary font-black uppercase tracking-widest sm:tracking-[0.4em] text-xl sm:text-2xl opacity-60">No boards active</p>
                  <p className="text-secondary opacity-20 text-sm font-bold uppercase tracking-widest">Construct your first professional layout</p>
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
