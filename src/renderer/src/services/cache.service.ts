class CacheService {
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  get<T>(key: string): T | null {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    localStorage.clear()
  }
}

export const cacheService = new CacheService()
