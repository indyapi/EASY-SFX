export type SFX = {
  id: string
  name: string
  source: 'local' | 'myinstants'
  filePath: string // absolute path (AppData or Local)
  originalUrl?: string // for myinstants
  tags: string[]
  createdAt: string
}

export type PlayMode = 'overlap' | 'exclusive' | 'queue'

export type LibraryState = {
  list: SFX[]
}

export type PlaylistItem = {
  id: string
  rootId: string // reference SFX.id
  rootName: string // original name for fallback
  customName?: string // user-defined name
  filePath: string // full path for direct playing
  hotkey: string // VK code combo (e.g. Ctrl+KeyA)
  volume: number // 0 - 100
}

export type Playlist = {
  id: string
  name: string
  masterVolume: number // 0 - 100
  items: PlaylistItem[]
  createdAt: string
}
