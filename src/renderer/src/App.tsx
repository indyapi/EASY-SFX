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
  
  const initStore = useSoundStore((state) => state.init)
  const isLoading = useSoundStore((state) => state.isLoading)
  const playlists = useSoundStore((state) => state.playlists)
  const sounds = useSoundStore((state) => state.sounds)
  const theme = useSoundStore((state) => state.theme)
  const t = useSoundStore((state) => state.translations)

  useEffect(() => {
    initStore()
  }, [initStore])

  // Apply Theme
  useEffect(() => {
    const applyTheme = async () => {
      const resourcesDir = await window.api.getResourcesDir()
      const linkId = 'theme-link'
      let link = document.getElementById(linkId) as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.id = linkId
        link.rel = 'stylesheet'
        document.head.appendChild(link)
      }
      
      const themePath = `${resourcesDir}/assets/styles/${theme}.css`.replace(/\\/g, '/')
      link.href = `file:///${themePath}?t=${Date.now()}`
      document.body.className = `theme-${theme}`
    }
    
    applyTheme()
  }, [theme])

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

      <div className="fixed bottom-4 right-4 text-[9px] font-black text-secondary opacity-20 uppercase tracking-widest pointer-events-none">
        Easy SFX v1.0 • Ctrl+Shift+D for DevTools
      </div>
    </div>
  )
}

export default App
