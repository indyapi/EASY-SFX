import { useHotkeys } from 'react-hotkeys-hook'
import { useSoundStore } from '../store/useSoundStore'

export const useHotkeyToggle = () => {
  const isHotkeyEnabled = useSoundStore((state) => state.isHotkeyEnabled)
  const setHotkeyEnabled = useSoundStore((state) => state.setHotkeyEnabled)
  
  // Home key toggle
  useHotkeys('home', () => {
    setHotkeyEnabled(!isHotkeyEnabled)
    console.log('[HotkeyToggle] Hotkeys', !isHotkeyEnabled ? 'ENABLED' : 'DISABLED')
  }, { preventDefault: true })
  
  return { isHotkeyEnabled, setHotkeyEnabled }
}
