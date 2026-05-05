import React, { useState, useEffect } from 'react'
import { useSoundStore } from './store/useSoundStore'
import { hotkeyService } from './services/hotkey.service'
import { audioService } from './services/audio.service'

// Components
import Navbar from './components/Navbar'
import LibraryTab from './components/LibraryTab'
import FavoriteTab from './components/FavoriteTab'
import PlaylistTab from './components/PlaylistTab'
import SettingsModal from './components/SettingsModal'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'favorite' | 'playlist'>('playlist')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  
  const initStore = useSoundStore((state) => state.init)
  const isLoading = useSoundStore((state) => state.isLoading)
  const playlists = useSoundStore((state) => state.playlists)
  const sounds = useSoundStore((state) => state.sounds)
  const theme = useSoundStore((state) => state.theme)
  const libraryMasterVolume = useSoundStore((state) => state.libraryMasterVolume)
  const t = useSoundStore((state) => state.translations)

  useEffect(() => {
    initStore()
  }, [initStore])

  // Sync Master Volume
  useEffect(() => {
    import('./services/soundEngine').then(({ soundEngine }) => {
      soundEngine.setMasterVolume(libraryMasterVolume)
    })
  }, [libraryMasterVolume])

  useEffect(() => {
    hotkeyService.init()
    
    // Register all hotkeys from all playlists
    playlists.forEach(pl => {
      pl.items.forEach(item => {
        if (item.hotkey) {
          const sfx = sounds.find(s => s.id === item.rootId)
          if (sfx) {
            hotkeyService.register(item.hotkey, () => {
              // Use the calculated volume with master multiplier
              const finalVolume = (item.volume / 100) * (pl.masterVolume / 100) * 100
              audioService.play(sfx, pl.id, finalVolume)
            })
          }
        }
      })
    })

    return () => {
      hotkeyService.unregisterAll()
      hotkeyService.destroy()
    }
  }, [playlists, sounds])

  if (isLoading || !t.common) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-tint">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-tint border-t-transparent" />
          <p className="text-sm font-black uppercase tracking-widest">{t.common?.loading || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (!hasStarted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tint/10 rounded-full blur-[120px] animate-pulse-subtle"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[150px] animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 flex flex-col items-center max-w-lg w-full p-12 text-center">
          <div className="group relative mb-12 cursor-pointer transition-transform duration-700 hover:scale-110 active:scale-95" onClick={() => setHasStarted(true)}>
             <div className="absolute inset-0 bg-tint/20 rounded-[48px] blur-2xl group-hover:blur-3xl transition-all"></div>
             <div className="relative h-32 w-32 bg-zinc-900 border border-white/10 rounded-[40px] flex items-center justify-center text-6xl shadow-2xl overflow-hidden">
                <span className="group-hover:rotate-12 transition-transform duration-500">🎙️</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-tint/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
          </div>

          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
            EASY <span className="text-tint italic">SFX</span>
          </h1>
          <p className="text-sm font-bold text-secondary opacity-40 uppercase tracking-[0.4em] mb-12">Ultimate Soundboard Experience</p>
          
          <button 
            onClick={() => {
              console.log('[App] App initialized by user click')
              setHasStarted(true)
            }}
            className="group relative w-full py-6 rounded-[32px] bg-white text-zinc-950 font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-tint/20 hover:bg-tint transition-all active:scale-95 overflow-hidden border-none"
          >
            <span className="relative z-10">Initialize Engine</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white to-sky-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          <p className="mt-8 text-[10px] font-black text-secondary opacity-20 uppercase tracking-widest">Designed for Professional Streamers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-app text-primary overflow-hidden">
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onSettingsClick={() => setIsSettingsOpen(true)} 
      />
      
      <main className="flex-1 overflow-hidden p-8">
        {activeTab === 'library' && <LibraryTab />}
        {activeTab === 'favorite' && <FavoriteTab />}
        {activeTab === 'playlist' && <PlaylistTab />}
      </main>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

      <div className="fixed bottom-2 right-4 text-[7px] font-black text-secondary opacity-10 uppercase tracking-widest pointer-events-none z-40">
        Easy SFX v1.0 • Ctrl+Shift+D for DevTools
      </div>
    </div>
  )
}

export default App
