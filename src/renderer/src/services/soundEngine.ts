import { Howl } from 'howler'
import { SFX } from '../types'

/**
 * Dedicated Sound Engine to handle playback logic,
 * volume management, and instance tracking.
 */
class SoundEngine {
  private instances: Map<string, Howl> = new Map()

  createInstance(sfx: SFX, volume: number, onEnd: () => void, onError: (err: any) => void): Howl {
    // Ensure we use absolute file:// URLs. 
    // We need to handle Windows drive letters correctly.
    const normalizedPath = sfx.filePath.replace(/\\/g, '/')
    const fileUrl = `file:///${normalizedPath}`

    const howl = new Howl({
      src: [fileUrl],
      volume: Math.max(0, Math.min(2, volume / 100)),
      html5: true, 
      format: ['mp3', 'wav', 'ogg'],
      onend: () => {
        this.instances.delete(sfx.id)
        onEnd()
      },
      onloaderror: (_id, error) => {
        this.instances.delete(sfx.id)
        onError(error)
      },
      onplayerror: (_id, error) => {
        this.instances.delete(sfx.id)
        onError(error)
      }
    })

    this.instances.set(sfx.id, howl)
    return howl
  }

  stop(id: string) {
    const instance = this.instances.get(id)
    if (instance) {
      instance.stop()
      instance.unload()
      this.instances.delete(id)
    }
  }

  stopAll() {
    this.instances.forEach(howl => {
      howl.stop()
      howl.unload()
    })
    this.instances.clear()
  }
}

export const soundEngine = new SoundEngine()
