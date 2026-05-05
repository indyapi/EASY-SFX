class HotkeyService {
  private listeners: Map<string, () => void> = new Map()
  private unsubscribe: (() => void) | null = null

  init(): void {
    if (this.unsubscribe) this.unsubscribe()
    
    this.unsubscribe = window.api.onShortcutPressed((accelerator) => {
      const callback = this.listeners.get(accelerator)
      if (callback) {
        callback()
      }
    })
  }

  async register(accelerator: string, callback: () => void): Promise<boolean> {
    const success = await window.api.registerShortcut(accelerator)
    if (success) {
      this.listeners.set(accelerator, callback)
    }
    return success
  }

  async unregister(accelerator: string): Promise<void> {
    await window.api.unregisterShortcut(accelerator)
    this.listeners.delete(accelerator)
  }

  async unregisterAll(): Promise<void> {
    await window.api.unregisterAllShortcuts()
    this.listeners.clear()
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }
}

export const hotkeyService = new HotkeyService()
