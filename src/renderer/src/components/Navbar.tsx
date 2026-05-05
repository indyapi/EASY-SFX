import React from 'react'
import logo from '../../../../resources/assets/imgs/easysfx.png'
import { useSoundStore } from '../store/useSoundStore'

interface NavbarProps {
  activeTab: 'library' | 'playlist'
  onTabChange: (tab: 'library' | 'playlist') => void
  onSettingsClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onSettingsClick }) => {
  const t = useSoundStore((state) => state.translations)
  const theme = useSoundStore((state) => state.theme)
  const setTheme = useSoundStore((state) => state.setTheme)

  return (
    <nav className="flex h-16 sm:h-20 w-full items-center justify-between border-b border-white/5 bg-black/40 px-4 sm:px-8 shrink-0">
      {/* Left: App Icon & Name */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-tint to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-tint/10 flex-shrink-0">
            <img src={logo} alt="EASY SFX" className="h-6 w-6 sm:h-8 sm:w-8 object-contain brightness-0 invert" />
        </div>
        <span className="text-lg sm:text-2xl font-black tracking-tighter text-white hidden sm:block">
            EASY <span className="text-tint italic">SFX</span>
        </span>
      </div>

      {/* Center: Tabs (Responsive) */}
      <div className="flex items-center gap-1 sm:gap-1.5 rounded-2xl bg-black/40 p-1 sm:p-1.5 border border-white/5 mx-2">
        {(['library', 'playlist'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              px-3 sm:px-6 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all rounded-xl sm:rounded-2xl
              ${activeTab === tab 
                ? 'bg-tint text-zinc-950 shadow-md shadow-tint/20' 
                : 'text-secondary hover:text-zinc-300 hover:bg-white/5'}
            `}
          >
            <span className="hidden sm:inline">{t.nav?.[tab]}</span>
            <span className="sm:hidden">{tab === 'library' ? '📦' : '🍱'}</span>
          </button>
        ))}
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
            className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:border-tint/30 hover:text-tint transition-all text-base sm:text-xl shadow-lg active:scale-95"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={onSettingsClick}
            title={t.nav?.settings} 
            className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl sm:rounded-2xl hover:bg-white/5 hover:text-tint transition-all text-base sm:text-xl shadow-lg active:scale-95 border border-transparent hover:border-white/5 text-secondary"
          >
            ⚙️
          </button>
      </div>
    </nav>
  )
}

export default Navbar
