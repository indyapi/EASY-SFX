import React, { useState } from 'react'
import { useSoundStore } from '../store/useSoundStore'
import { audioService } from '../services/audio.service'
import { Playlist, PlaylistItem } from '../types'
import AddSFXModal from './AddSFXModal'

const PlaylistTab: React.FC = () => {
  const playlists = useSoundStore((state) => state.playlists)
  const sounds = useSoundStore((state) => state.sounds)
  const createNewPlaylist = useSoundStore((state) => state.createNewPlaylist)
  const removePlaylist = useSoundStore((state) => state.removePlaylist)
  const updatePlaylist = useSoundStore((state) => state.updatePlaylist)
  const t = useSoundStore((state) => state.translations)
  
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [unlockId, setUnlockId] = useState<string | null>(null)
  const [lockCode, setLockCode] = useState('')

  const handleCreate = async () => {
    const name = window.prompt(t.playlist?.prompt)
    if (name) {
      await createNewPlaylist(name)
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

  const handleLock = async (pl: Playlist) => {
    if (pl.locked) {
        if (confirm('Unlock this playlist permanently?')) {
            await updatePlaylist({ ...pl, locked: false, passwordHash: undefined })
        }
        return
    }
    const code = window.prompt(t.playlist?.lockCode)
    if (code && code.length >= 8) {
      await updatePlaylist({ ...pl, locked: true, passwordHash: code })
    } else if (code) {
      alert(t.playlist?.codeLength)
    }
  }

  const handleUnlock = (pl: Playlist) => {
    if (lockCode === pl.passwordHash) {
      setEditingPlaylist(pl)
      setUnlockId(null)
      setLockCode('')
    } else {
      alert(t.playlist?.wrongCode)
    }
  }

  const handleOpenPlaylist = (pl: Playlist) => {
    if (pl.locked) {
      setUnlockId(pl.id)
    } else {
      setEditingPlaylist(pl)
    }
  }

  const handleRenamePlaylist = async (pl: Playlist) => {
      const newName = window.prompt('Enter new playlist name:', pl.name)
      if (newName && newName !== pl.name) {
          await updatePlaylist({ ...pl, name: newName })
      }
  }

  const handleEditItemName = async (item: PlaylistItem) => {
      const newName = window.prompt('Enter custom name:', item.customName)
      if (newName && editingPlaylist) {
          const newItems = editingPlaylist.items.map(i => i.id === item.id ? { ...i, customName: newName } : i)
          await updatePlaylist({ ...editingPlaylist, items: newItems })
      }
  }

  const handleRemoveItem = async (item: PlaylistItem) => {
      if (editingPlaylist && confirm('Remove this sound from playlist?')) {
          const newItems = editingPlaylist.items.filter(i => i.id !== item.id)
          await updatePlaylist({ ...editingPlaylist, items: newItems })
      }
  }

  if (editingPlaylist) {
    const pl = playlists.find(p => p.id === editingPlaylist.id) || editingPlaylist

    return (
      <div className="flex h-full flex-col gap-6 animate-scale-in">
        <div className="flex items-center justify-between p-5 nav-bg rounded-[32px] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
            <button onClick={() => setEditingPlaylist(null)} className="h-12 w-12 flex items-center justify-center rounded-2xl hover:bg-white/5 text-secondary transition-all text-xl" title={t.common?.back}>←</button>
            <div>
              <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-primary">{pl.name}</h2>
                  <button onClick={() => handleRenamePlaylist(pl)} className="text-tint opacity-30 hover:opacity-100 transition-all text-sm">✎</button>
              </div>
              <p className="text-[10px] font-black text-secondary opacity-30 uppercase tracking-[0.2em]">{pl.items.length} {t.playlist?.items} CONFIGURED</p>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-6 px-10 border-x border-white/5">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-black text-secondary opacity-30 uppercase tracking-widest">{t.playlist?.masterVolume}</span>
                <span className="text-sm font-black text-tint">{pl.masterVolume}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={pl.masterVolume} 
                onChange={(e) => handleUpdateMasterVolume(parseInt(e.target.value))}
                className="w-48 h-1 bg-black/30 rounded-lg appearance-none cursor-pointer accent-tint"
              />
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-8 py-3.5 rounded-2xl btn-tint text-[11px] font-black uppercase tracking-widest shadow-xl shadow-tint/20"
              >
                {t.playlist?.addSounds}
              </button>
              <button 
                onClick={() => handleLock(pl)}
                className={`h-12 w-12 flex items-center justify-center rounded-2xl nav-bg border border-white/5 hover:border-tint/30 transition-all ${pl.locked ? 'text-tint border-tint/30 shadow-[0_0_20px_rgba(0,217,255,0.15)]' : 'text-secondary opacity-40'}`}
                title="Toggle Lock Protection"
              >
                {pl.locked ? '🔒' : '🔓'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-12">
            {pl.items.map(item => {
              const sfx = sounds.find(s => s.id === item.rootId)
              return (
                <div key={item.id} className="group relative rounded-[32px] card-bg border border-white/5 p-6 transition-all hover:border-tint/30 shadow-lg hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex h-full flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 flex items-center justify-center rounded-[18px] bg-black/30 text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-inner" onClick={() => handlePlay(item)}>
                        🔊
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                         <span className="text-[8px] font-black text-secondary opacity-30 uppercase tracking-widest">{t.playlist?.hotkey}</span>
                         <span className="px-3 py-1 rounded-xl bg-black/40 text-[10px] font-black text-tint border border-tint/20 shadow-sm">
                           {item.hotkey || 'NONE'}
                         </span>
                      </div>
                    </div>
                    
                    <div className="w-full relative px-1">
                      <div className="flex items-center justify-between group/name">
                          <p className="text-[13px] font-black text-primary truncate uppercase tracking-tight pr-4">{item.customName}</p>
                          <button onClick={() => handleEditItemName(item)} className="opacity-0 group-hover/name:opacity-100 text-tint transition-all text-xs">✎</button>
                      </div>
                      <p className="text-[9px] font-bold text-secondary opacity-25 truncate italic mt-1 uppercase tracking-tighter">Source: {sfx?.name || 'Missing Sound'}</p>
                    </div>

                    <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-secondary opacity-30 uppercase tracking-widest">{t.playlist?.volume}</span>
                        <span className="text-[10px] font-black text-tint">{item.volume}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="200" value={item.volume} 
                        onChange={(e) => handleUpdateVolume(item, parseInt(e.target.value))}
                        className="w-full h-1 bg-black/30 rounded-lg appearance-none cursor-pointer accent-tint"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRemoveItem(item)}
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90 transition-all shadow-xl z-10 border-4 border-app"
                  >
                    ×
                  </button>
                </div>
              )
            })}
            {pl.items.length === 0 && (
                <div className="col-span-full h-80 flex flex-col items-center justify-center bg-black/5 rounded-[48px] border border-dashed border-white/5 gap-5">
                   <div className="text-6xl opacity-10">📥</div>
                   <div className="text-center">
                       <p className="text-secondary opacity-40 font-black uppercase tracking-widest text-sm">Your board is empty</p>
                       <button onClick={() => setShowAddModal(true)} className="text-xs font-black text-tint uppercase tracking-widest mt-4 px-6 py-2 rounded-xl bg-tint/5 border border-tint/20 hover:bg-tint hover:text-black transition-all">Start adding sounds</button>
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
    <div className="flex h-full w-full flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary">{t.playlist?.title}</h2>
            <p className="text-[10px] font-bold text-secondary opacity-30 uppercase tracking-[0.2em] mt-1">Manage your custom soundboards</p>
        </div>
        <button 
          onClick={handleCreate}
          className="px-6 py-3 rounded-2xl nav-bg border border-white/5 text-[11px] font-black uppercase tracking-widest text-secondary hover:text-tint hover:border-tint/30 transition-all shadow-xl"
        >
          {t.playlist?.new}
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
            <button 
              onClick={handleCreate}
              className="group relative flex flex-col items-center gap-6 p-20 rounded-[60px] border border-dashed border-white/10 hover:border-tint/50 transition-all bg-black/5"
            >
              <div className="text-8xl group-hover:scale-110 transition-transform duration-700">🎵</div>
              <div className="text-center space-y-2">
                  <p className="text-secondary font-black uppercase tracking-widest text-lg opacity-60">{t.playlist?.empty}</p>
                  <p className="text-secondary opacity-20 text-xs font-bold">Start your collection in seconds</p>
              </div>
              <span className="text-[11px] font-black text-tint uppercase tracking-[0.3em] animate-pulse-subtle bg-tint/5 px-6 py-2 rounded-full border border-tint/10">Click to start</span>
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {playlists.map((pl) => (
            <div 
              key={pl.id} 
              className="group relative rounded-[40px] card-bg border border-white/5 p-8 transition-all hover:border-tint/40 cursor-pointer overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2"
              onClick={() => handleOpenPlaylist(pl)}
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div className={`h-16 w-16 flex items-center justify-center rounded-[22px] bg-black/30 text-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${pl.locked ? 'text-tint shadow-[0_0_30px_rgba(0,217,255,0.2)]' : 'text-primary/40'}`}>
                    {pl.locked ? '🔒' : '🎵'}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('Delete playlist?')) removePlaylist(pl.id); }}
                      className="h-10 w-10 flex items-center justify-center rounded-2xl bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary uppercase tracking-tight truncate mb-2">{pl.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-secondary opacity-30 uppercase tracking-widest">{pl.items.length} {t.playlist?.items}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-tint opacity-20"></div>
                    <span className="text-[10px] font-black text-tint uppercase tracking-widest">{pl.masterVolume}% VOL</span>
                  </div>
                </div>
              </div>

              {/* Unlock Overlay */}
              {unlockId === pl.id && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/98 p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
                  <div className="h-20 w-20 flex items-center justify-center rounded-3xl bg-tint/5 border border-tint/20 text-4xl mb-8 animate-pulse">🔐</div>
                  <span className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] mb-6 opacity-40">{t.playlist?.enterCode}</span>
                  <input 
                    type="password" 
                    autoFocus
                    maxLength={12}
                    value={lockCode}
                    onChange={e => setLockCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUnlock(pl)}
                    className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 text-center text-4xl font-black text-tint mb-8 focus:outline-none focus:border-tint transition-all tracking-[0.5em] shadow-inner"
                    placeholder="••••"
                  />
                  <div className="flex gap-4 w-full">
                    <button onClick={() => setUnlockId(null)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors">{t.common?.cancel}</button>
                    <button onClick={() => handleUnlock(pl)} className="flex-[2] py-4 rounded-[20px] btn-tint text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-tint/30 transition-transform active:scale-95">{t.playlist?.unlock}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlaylistTab
