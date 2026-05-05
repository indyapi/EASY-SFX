import { useState, useCallback } from 'react'

export const useFullscreenSFX = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const newState = !prev
      if (newState) {
        document.body.classList.add('sfx-fullscreen')
      } else {
        document.body.classList.remove('sfx-fullscreen')
      }
      return newState
    })
  }, [])
  
  return { isFullscreen, toggleFullscreen }
}
