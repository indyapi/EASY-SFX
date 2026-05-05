import { create } from 'zustand'
import { SFX, Playlist, PlayMode } from '../types'
import { fileService } from '../services/file.service'

interface SoundState {
  sounds: SFX[] // Local imports
  playlists: Playlist[]
  isLoading: boolean
  
  // Settings
  theme: 'dark' | 'light'
  language: 'en' | 'th'
  gridColumns: number
  libraryMasterVolume: number
  playMode: PlayMode
  translations: any
  playingSfxId: string | null
  isHotkeyEnabled: boolean

  // Actions
  init: () => Promise<void>
  setTheme: (theme: 'dark' | 'light') => void
  setLanguage: (lang: 'en' | 'th') => Promise<void>
  setGridColumns: (cols: number) => void
  setLibraryMasterVolume: (vol: number) => void
  setPlayMode: (mode: PlayMode) => void
  setPlayingSfxId: (id: string | null) => void
  setHotkeyEnabled: (enabled: boolean) => void
  
  importLocalSound: (path: string) => Promise<void>
  removeSound: (id: string) => void
  
  createNewPlaylist: (name: string) => Promise<void>
  updatePlaylist: (playlist: Playlist) => Promise<void>
  removePlaylist: (id: string) => Promise<void>
}

export const useSoundStore = create<SoundState>((set, get) => ({
  sounds: [],
  playlists: [],
  isLoading: false,
  theme: 'dark',
  language: 'en',
  gridColumns: 8,
  libraryMasterVolume: 100,
  playMode: 'overlap',
  translations: {},
  playingSfxId: null,
  isHotkeyEnabled: true,

  init: async () => {
    set({ isLoading: true })
    try {
      // Load settings
      const settings = await window.api.readJson('data/settings.json')
      const theme = settings?.theme || 'dark'
      const language = settings?.language || 'en'
      const gridColumns = settings?.gridColumns || 8
      const libraryMasterVolume = settings?.libraryMasterVolume !== undefined ? settings.libraryMasterVolume : 100
      const playMode = settings?.playMode || 'overlap'
      
      // Load translations
      const translations = await fileService.readLanguage(language)

      // 1. Safely read local library_list.json
      const libraryData = await fileService.readLibrary()
      
      // 2. Read other local data
      const playlists = await fileService.readAllPlaylists()

      set({ 
        sounds: libraryData ? libraryData.list : [], 
        playlists, 
        theme,
        language,
        gridColumns,
        libraryMasterVolume,
        playMode,
        translations,
        isLoading: false 
      })

      // Apply initial theme
      document.documentElement.classList.toggle('dark', theme === 'dark')
    } catch (error) {
      console.error('Store initialization failed:', error)
      set({ isLoading: false })
    }
  },

  setTheme: (theme) => {
    set({ theme })
    document.documentElement.classList.toggle('dark', theme === 'dark')
    const state = get()
    const settings = { 
      theme, 
      language: state.language, 
      gridColumns: state.gridColumns, 
      libraryMasterVolume: state.libraryMasterVolume, 
      playMode: state.playMode 
    }
    window.api.writeJson('data/settings.json', settings)
  },

  setLanguage: async (language) => {
    const translations = await fileService.readLanguage(language)
    set({ language, translations })
    const state = get()
    const settings = { 
      theme: state.theme, 
      language, 
      gridColumns: state.gridColumns, 
      libraryMasterVolume: state.libraryMasterVolume, 
      playMode: state.playMode 
    }
    window.api.writeJson('data/settings.json', settings)
  },

  setGridColumns: (gridColumns) => {
    set({ gridColumns })
    const settings = { theme: get().theme, language: get().language, gridColumns, libraryMasterVolume: get().libraryMasterVolume, playMode: get().playMode }
    window.api.writeJson('data/settings.json', settings)
  },

  setLibraryMasterVolume: (libraryMasterVolume) => {
    set({ libraryMasterVolume })
    const settings = { theme: get().theme, language: get().language, gridColumns: get().gridColumns, libraryMasterVolume, playMode: get().playMode }
    window.api.writeJson('data/settings.json', settings)
  },

  setPlayMode: (playMode) => {
    set({ playMode })
    const settings = { theme: get().theme, language: get().language, gridColumns: get().gridColumns, libraryMasterVolume: get().libraryMasterVolume, playMode }
    window.api.writeJson('data/settings.json', settings)
  },

  setPlayingSfxId: (playingSfxId) => set({ playingSfxId }),
  
  setHotkeyEnabled: (enabled) => set({ isHotkeyEnabled: enabled }),
  
  importLocalSound: async (path: string) => {
    const sfx = await fileService.importSound(path)
    set((state) => ({ sounds: [...state.sounds, sfx] }))
  },

  removeSound: async (id) => {
    const sound = get().sounds.find(s => s.id === id)
    if (sound && sound.source === 'local') {
      await fileService.deleteFile(sound.filePath)
    }
    set((state) => ({ sounds: state.sounds.filter((s) => s.id !== id) }))
    
    // Update local file only if it exists
    const library = await fileService.readLibrary()
    if (library) {
      library.list = library.list.filter(s => s.id !== id)
      await window.api.writeJson('data/library/library_list.json', library)
    }
  },

  createNewPlaylist: async (name: string) => {
    const id = `pl_${Date.now()}`
    const pl: Playlist = {
      id,
      name,
      masterVolume: 100,
      items: [],
      createdAt: new Date().toISOString()
    }
    await window.api.writeJson(`data/playlist/${id}.json`, pl)
    set((state) => ({ playlists: [...state.playlists, pl] }))
  },

  updatePlaylist: async (playlist) => {
    await window.api.writeJson(`data/playlist/${playlist.id}.json`, playlist)
    set((state) => ({
      playlists: state.playlists.map((p) => (p.id === playlist.id ? playlist : p))
    }))
  },

  removePlaylist: async (id) => {
    await window.api.deleteFile(`data/playlist/${id}.json`)
    set((state) => ({ playlists: state.playlists.filter((p) => p.id !== id) }))
  }
}))
