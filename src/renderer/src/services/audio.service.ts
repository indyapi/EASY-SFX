import { SFX } from '../types'
import { soundEngine } from './soundEngine'

class AudioService {
  private log(message: string, type: 'info' | 'error' | 'success' = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    const color = type === 'error' ? 'red' : type === 'success' ? 'yellow' : 'gray'
    console.log(`%c[AUDIO ${timestamp}] ${message}`, `color: ${color}; font-weight: bold;`)
  }

  async play(sfx: SFX, _playlistId: string = 'library', volume: number = 100): Promise<void> {
    if (!sfx.filePath) {
      this.log(`No valid filePath for ${sfx.name}`, 'error')
      return
    }

    // Lazy load store to avoid circular deps
    const { useSoundStore } = await import('../store/useSoundStore')
    const store = useSoundStore.getState()
    const setPlayingId = store.setPlayingSfxId
    
    // Apply library master volume if playing from library (default case)
    let finalVolume = volume
    if (_playlistId === 'library') {
      finalVolume = (volume / 100) * (store.libraryMasterVolume / 100) * 100
    }

    this.log(`Attempting to play: ${sfx.name} (Volume: ${finalVolume}%)`, 'info')

    // Stop existing instance if same ID is playing
    soundEngine.stop(sfx.id)

    const player = soundEngine.createInstance(
      sfx, 
      finalVolume,
      () => {
        this.log(`Finished: ${sfx.name}`, 'info')
        setPlayingId(null)
      },
      (error) => {
        this.log(`Error playing ${sfx.name}: ${error}`, 'error')
        setPlayingId(null)
      }
    )

    setPlayingId(sfx.id)
    player.play()
    this.log(`Playing: ${sfx.name}`, 'success')
  }

  stop(id: string): void {
    soundEngine.stop(id)
  }

  stopAll(): void {
    this.log('Stopping all active sounds.', 'info')
    soundEngine.stopAll()
  }
}

export const audioService = new AudioService()