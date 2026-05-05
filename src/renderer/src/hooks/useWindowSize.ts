import { useEffect, useState } from 'react'

export const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    updateSize()
    
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  return size
}

export const getGridCols = (width: number): number => {
  if (width < 640) return 2
  if (width < 768) return 3
  if (width < 1024) return 4
  if (width < 1280) return 5
  if (width < 1536) return 6
  return 8
}
