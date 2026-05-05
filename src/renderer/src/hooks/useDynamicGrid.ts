import { useState, useCallback, useEffect } from 'react'
import { useWindowSize } from './useWindowSize'
import { useSoundStore } from '../store/useSoundStore'

export const useDynamicGrid = () => {
  const { width } = useWindowSize()
  const gridColumns = useSoundStore((state) => state.gridColumns)
  const setGridColumns = useSoundStore((state) => state.setGridColumns)
  
  // Dynamic constraints based on window width
  const maxAllowed = Math.min(18, Math.floor((width - 64) / 100))
  const minAllowed = Math.max(2, Math.floor((width - 64) / 400))
  
  const setClampedCols = useCallback((value: number) => {
    const clamped = Math.max(4, Math.min(18, value))
    setGridColumns(clamped)
  }, [setGridColumns])
  
  return { 
    cols: gridColumns, 
    setClampedCols, 
    maxCols: 18, 
    minCols: 4,
    effectiveMax: maxAllowed,
    effectiveMin: minAllowed
  }
}
