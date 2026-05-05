import { SFX, Playlist } from '../types'

class FileService {
  async selectFile(): Promise<string | null> {
    return window.api.selectFile()
  }

  async importSound(sourcePath: string): Promise<SFX> {
    const absolutePath = await window.api.importFile(sourcePath)
    const name = absolutePath.split(/[\\/]/).pop()?.split('.')[0] || 'Unknown'
    
    const sfx: SFX = {
      id: `local_${Date.now()}`,
      name,
      source: 'local',
      filePath: absolutePath,
      tags: [],
      createdAt: new Date().toISOString()
    }

    const library = (await window.api.readJson('data/library/library_list.json')) || { list: [] }
    library.list.push(sfx)
    await window.api.writeJson('data/library/library_list.json', library)

    return sfx
  }

  async readLibrary(): Promise<{ list: SFX[] } | null> {
    const data = await window.api.readJson('data/library/library_list.json')
    if (!data || !data.list || data.list.length === 0) {
      return null
    }
    return data
  }

  async createPlaylist(name: string): Promise<Playlist> {
    const id = `pl_${Date.now()}`
    const playlist: Playlist = {
      id,
      name,
      masterVolume: 100,
      items: [],
      createdAt: new Date().toISOString()
    }
    await window.api.writeJson(`data/playlist/${id}.json`, playlist)
    return playlist
  }

  async readAllPlaylists(): Promise<Playlist[]> {
    const files = await window.api.readDir('data/playlist')
    const playlists: Playlist[] = []
    for (const file of files) {
      if (file.endsWith('.json')) {
        const pl = await window.api.readJson(`data/playlist/${file}`)
        if (pl && pl.id) playlists.push(pl)
      }
    }
    return playlists
  }

  async readLanguage(lang: string): Promise<any> {
    return window.api.readJson(`assets/lang/${lang}.json`)
  }

  async deleteFile(path: string): Promise<boolean> {
    return window.api.deleteFile(path)
  }
}

export const fileService = new FileService()
