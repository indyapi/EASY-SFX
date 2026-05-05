import React, { useState } from 'react'
import { useSoundStore } from '../store/useSoundStore'
import { audioService } from '../services/audio.service'

const FavoriteTab: React.FC = () => {
  const favorites = useSoundStore((state) => state.favorites)
  const sounds = useSoundStore((state) => state.sounds)
  const createNewFavoriteFolder = useSoundStore((state) => state.createNewFavoriteFolder)
  const removeFavoriteFolder = useSoundStore((state) => state.removeFavoriteFolder)
  const updateFavoriteFolder = useSoundStore((state) => state.updateFavoriteFolder)
  const t = useSoundStore((state) => state.translations)
  
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)

  const handleCreate = async () => {
    const name = window.prompt(t.favorite?.prompt)
    if (name) {
      await createNewFavoriteFolder(name)
    }
  }

  const handleRename = async (folder: any) => {
    const newName = window.prompt('Enter new name:', folder.name)
    if (newName && newName !== folder.name) {
      await updateFavoriteFolder({ ...folder, name: newName })
    }
  }

  const handleRemoveItem = async (folder: any, sfxId: string) => {
    if (confirm('Remove this sound from Save?')) {
        const newItems = folder.items.filter((id: string) => id !== sfxId)
        await updateFavoriteFolder({ ...folder, items: newItems })
    }
  }

  const activeFolder = favorites.find(f => f.id === editingFolderId)

  if (activeFolder) {
    return (
      <div className="flex h-full flex-col gap-6 animate-scale-in">
        <div className="flex items-center justify-between p-4 nav-bg rounded-3xl border border-white/5 shadow-lg">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setEditingFolderId(null)} 
                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-secondary transition-colors"
                title={t.favorite?.backToSaves}
            >
                {t.common?.back || '←'}
            </button>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-primary">{activeFolder.name}</h2>
              <p className="text-[10px] font-bold text-secondary opacity-50">{activeFolder.items.length} {t.favorite?.items}</p>
            </div>
          </div>
          <button 
            onClick={() => handleRename(activeFolder)}
            className="px-4 py-2 rounded-xl nav-bg border border-white/5 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-tint hover:border-tint/30 transition-all shadow-sm"
          >
            {t.favorite?.rename}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 pb-12">
            {activeFolder.items.map(sfxId => {
              const sfx = sounds.find(s => s.id === sfxId)
              if (!sfx) return null
              return (
                <div 
                  key={sfxId} 
                  onClick={() => audioService.play(sfx)}
                  className="group relative aspect-square rounded-[24px] card-bg border border-white/5 p-4 transition-all hover:border-tint/30 flex flex-col items-center justify-center gap-2 text-center shadow-md hover:shadow-xl cursor-pointer active:scale-95"
                >
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🔊</div>
                  <span className="text-[10px] font-black text-primary truncate w-full px-1 uppercase tracking-tight">{sfx.name}</span>
                  <button 
                    onClick={() => handleRemoveItem(activeFolder, sfxId)}
                    className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90 transition-all text-[10px] flex items-center justify-center shadow-lg z-10"
                    title={t.favorite?.removeFromSave}
                  >
                    ×
                  </button>
                </div>
              )
            })}
            {activeFolder.items.length === 0 && (
                <div className="col-span-full h-64 flex flex-col items-center justify-center nav-bg/30 rounded-[40px] border border-dashed border-white/5 gap-3">
                   <div className="text-5xl opacity-20 mb-2">📁</div>
                   <p className="text-secondary opacity-40 italic text-sm text-center px-10">
                      {t.favorite?.addFromLibrary}
                   </p>
                </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-tight text-primary">{t.favorite?.title}</h2>
        <button 
          onClick={handleCreate}
          className="px-4 py-2 rounded-xl nav-bg border border-white/5 text-xs font-black uppercase tracking-widest text-secondary hover:text-tint hover:border-tint/30 transition-all shadow-sm"
        >
          {t.favorite?.new}
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
            <button 
              onClick={handleCreate}
              className="group relative flex flex-col items-center gap-4 p-16 rounded-[40px] border border-dashed border-white/10 hover:border-tint/50 transition-all bg-black/5"
            >
              <div className="text-7xl group-hover:scale-110 transition-transform duration-500">📁</div>
              <p className="text-secondary font-bold opacity-50 max-w-[200px] text-center">{t.favorite?.empty}</p>
              <span className="text-[10px] font-black text-tint uppercase tracking-[0.2em] animate-pulse-subtle">Click to start</span>
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((folder) => (
            <div 
              key={folder.id} 
              onClick={() => setEditingFolderId(folder.id)}
              className="group relative rounded-[32px] card-bg border border-white/5 p-7 transition-all hover:border-tint/30 cursor-pointer shadow-2xl overflow-hidden hover:-translate-y-1"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-black/30 text-4xl group-hover:scale-110 transition-transform duration-300">📁</div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('Delete save folder?')) removeFavoriteFolder(folder.id); }}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary uppercase tracking-tight truncate mb-1">{folder.name}</h3>
                  <p className="text-[10px] font-black text-secondary opacity-40 uppercase tracking-widest">{folder.items.length} {t.favorite?.items}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoriteTab
