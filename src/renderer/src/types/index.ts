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

export type FavoriteFolder = {
  id: string
  name: string
  items: string[] // array of SFX id
  createdAt: string
}

export type PlaylistItem = {
  id: string
  rootId: string // reference SFX.id
  customName: string
  hotkey: string // VK code (KeyA, KeyB...)
  volume: number // 0 - 200
}

export type Playlist = {
  id: string
  name: string
  locked: boolean
  passwordHash?: string
  masterVolume: number // 0 - 100
  items: PlaylistItem[]
  createdAt: string
}
