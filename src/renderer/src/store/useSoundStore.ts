import { create } from 'zustand'
import { SFX, Playlist, FavoriteFolder } from '../types'
import { fileService } from '../services/file.service'

interface SoundState {
  sounds: SFX[] // Local imports
  playlists: Playlist[]
  favorites: FavoriteFolder[]
  isLoading: boolean
  
  // Settings
  theme: 'dark' | 'light'
  language: 'en' | 'th'
  gridColumns: number
  libraryMasterVolume: number
  translations: any
  playingSfxId: string | null

  // Actions
  init: () => Promise<void>
  setTheme: (theme: 'dark' | 'light') => void
  setLanguage: (lang: 'en' | 'th') => Promise<void>
  setGridColumns: (cols: number) => void
  setLibraryMasterVolume: (vol: number) => void
  setPlayingSfxId: (id: string | null) => void
  
  importLocalSound: (path: string) => Promise<void>
  removeSound: (id: string) => void
  
  createNewPlaylist: (name: string) => Promise<void>
  updatePlaylist: (playlist: Playlist) => Promise<void>
  removePlaylist: (id: string) => Promise<void>
  
  createNewFavoriteFolder: (name: string) => Promise<void>
  updateFavoriteFolder: (folder: FavoriteFolder) => Promise<void>
  removeFavoriteFolder: (id: string) => Promise<void>
}

export const useSoundStore = create<SoundState>((set, get) => ({
  sounds: [],
  playlists: [],
  favorites: [],
  isLoading: false,
  theme: 'dark',
  language: 'en',
  gridColumns: 8,
  libraryMasterVolume: 100,
  translations: {},
  playingSfxId: null,

  init: async () => {
    set({ isLoading: true })
    try {
      // Load settings
      const settings = await window.api.readJson('data/settings.json')
      const theme = settings?.theme || 'dark'
      const language = settings?.language || 'en'
      const gridColumns = settings?.gridColumns || 8
      const libraryMasterVolume = settings?.libraryMasterVolume !== undefined ? settings.libraryMasterVolume : 100
      
      // Load translations
      const translations = await fileService.readLanguage(language)

      // 1. Safely read local library_list.json
      const libraryData = await fileService.readLibrary()
      
      // 2. Read other local data
      const [playlists, favorites] = await Promise.all([
        fileService.readAllPlaylists(),
        fileService.readAllFavorites()
      ])

      set({ 
        sounds: libraryData ? libraryData.list : [], 
        playlists, 
        favorites,
        theme,
        language,
        gridColumns,
        libraryMasterVolume,
        translations,
        isLoading: false 
      })
    } catch (error) {
      console.error('Store initialization failed:', error)
      set({ isLoading: false })
    }
  },

  setTheme: (theme) => {
    set({ theme })
    const settings = { theme, language: get().language, gridColumns: get().gridColumns, libraryMasterVolume: get().libraryMasterVolume }
    window.api.writeJson('data/settings.json', settings)
  },

  setLanguage: async (language) => {
    const translations = await fileService.readLanguage(language)
    set({ language, translations })
    const settings = { theme: get().theme, language, gridColumns: get().gridColumns, libraryMasterVolume: get().libraryMasterVolume }
    window.api.writeJson('data/settings.json', settings)
  },

  setGridColumns: (gridColumns) => {
    set({ gridColumns })
    const settings = { theme: get().theme, language: get().language, gridColumns, libraryMasterVolume: get().libraryMasterVolume }
    window.api.writeJson('data/settings.json', settings)
  },

  setLibraryMasterVolume: (libraryMasterVolume) => {
    set({ libraryMasterVolume })
    const settings = { theme: get().theme, language: get().language, gridColumns: get().gridColumns, libraryMasterVolume }
    window.api.writeJson('data/settings.json', settings)
  },

  setPlayingSfxId: (playingSfxId) => set({ playingSfxId }),
  
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
      locked: false,
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
  },

  createNewFavoriteFolder: async (name: string) => {
    const id = `fav_${Date.now()}`
    const folder: FavoriteFolder = {
      id,
      name,
      items: [],
      createdAt: new Date().toISOString()
    }
    // Store in dedicated folder as requested
    await window.api.writeJson(`data/favorite/${id}/${id}.json`, folder)
    set((state) => ({ favorites: [...state.favorites, folder] }))
  },

  updateFavoriteFolder: async (folder) => {
    await window.api.writeJson(`data/favorite/${folder.id}/${folder.id}.json`, folder)
    set((state) => ({
      favorites: state.favorites.map((f) => (f.id === folder.id ? folder : f))
    }))
  },

  removeFavoriteFolder: async (id) => {
    // Delete the whole directory for the favorite
    await window.api.deleteFile(`data/favorite/${id}`)
    set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) }))
  }
}))
