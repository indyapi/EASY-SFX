import { Howl } from 'howler'
import { SFX, PlayMode } from '../types'

/**
 * Dedicated Sound Engine to handle playback logic,
 * volume management, and instance tracking.
 */
class SoundEngine {
  private activeHowls: Set<Howl> = new Set()
  private instancesBySfxId: Map<string, Set<Howl>> = new Map()
  private queue: { sfx: SFX; volume: number; onStart: () => void; onEnd: () => void; onError: (err: any) => void }[] = []
  private isProcessingQueue = false
  private masterVolume = 1.0

  setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(2, vol / 100))
    this.activeHowls.forEach((howl) => {
      howl.volume(this.masterVolume)
    })
  }

  private createInstance(sfx: SFX, volume: number, onStart: () => void, onEnd: () => void, onError: (err: any) => void): Howl {
    const normalizedPath = sfx.filePath.replace(/\\/g, '/')
    
    let src = ''
    if (!normalizedPath.includes(':') && !normalizedPath.startsWith('/')) {
        src = `/${normalizedPath}`
    } else if (normalizedPath.toLowerCase().includes('resources/data/')) {
        const parts = normalizedPath.split('resources/data/')
        src = `/${parts[parts.length - 1]}`
    } else {
        src = `file:///${normalizedPath}`
    }

    const howl = new Howl({
      src: [src],
      volume: Math.max(0, Math.min(2, volume / 100)),
      html5: true, 
      format: ['mp3', 'wav', 'ogg'],
      onplay: () => {
        onStart()
      },
      onend: () => {
        this.removeInstance(sfx.id, howl)
        onEnd()
        this.checkQueue()
      },
      onloaderror: (_id, error) => {
        this.removeInstance(sfx.id, howl)
        onError(error)
        this.checkQueue()
      },
      onplayerror: (_id, error) => {
        this.removeInstance(sfx.id, howl)
        onError(error)
        this.checkQueue()
      }
    })

    this.addInstance(sfx.id, howl)
    return howl
  }

  private addInstance(sfxId: string, howl: Howl) {
    this.activeHowls.add(howl)
    if (!this.instancesBySfxId.has(sfxId)) {
      this.instancesBySfxId.set(sfxId, new Set())
    }
    this.instancesBySfxId.get(sfxId)!.add(howl)
  }

  private removeInstance(sfxId: string, howl: Howl) {
    this.activeHowls.delete(howl)
    const instances = this.instancesBySfxId.get(sfxId)
    if (instances) {
      instances.delete(howl)
      if (instances.size === 0) {
        this.instancesBySfxId.delete(sfxId)
      }
    }
    howl.unload()
  }

  async play(sfx: SFX, volume: number, mode: PlayMode, onStart: () => void, onEnd: () => void, onError: (err: any) => void) {
    if (mode === 'exclusive') {
      this.stopAll()
    }

    if (mode === 'queue') {
      this.queue.push({ sfx, volume, onStart, onEnd, onError })
      if (!this.isProcessingQueue) {
        this.processQueue()
      }
      return
    }

    const howl = this.createInstance(sfx, volume, onStart, onEnd, onError)
    howl.play()
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessingQueue = false
      return
    }

    this.isProcessingQueue = true
    const { sfx, volume, onStart, onEnd, onError } = this.queue.shift()!
    
    const howl = this.createInstance(sfx, volume, onStart, onEnd, onError)
    howl.play()
  }

  private checkQueue() {
    if (this.isProcessingQueue) {
      this.processQueue()
    }
  }

  stop(sfxId: string) {
    const instances = this.instancesBySfxId.get(sfxId)
    if (instances) {
      instances.forEach(howl => {
        howl.stop()
        howl.unload()
        this.activeHowls.delete(howl)
      })
      this.instancesBySfxId.delete(sfxId)
    }
  }

  stopAll() {
    this.activeHowls.forEach(howl => {
      howl.stop()
      howl.unload()
    })
    this.activeHowls.clear()
    this.instancesBySfxId.clear()
    this.queue = []
    this.isProcessingQueue = false
  }

  hasActiveInstances(sfxId: string): boolean {
    return this.instancesBySfxId.has(sfxId)
  }
}

export const soundEngine = new SoundEngine()
