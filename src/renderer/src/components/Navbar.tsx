import React from 'react'
import logo from '../../../../resources/assets/imgs/easysfx.png'
import { useSoundStore } from '../store/useSoundStore'

interface NavbarProps {
  activeTab: 'library' | 'favorite' | 'playlist'
  onTabChange: (tab: 'library' | 'favorite' | 'playlist') => void
  onSettingsClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onSettingsClick }) => {
  const t = useSoundStore((state) => state.translations)

  return (
    <nav className="flex h-16 w-full items-center justify-between border-b nav-bg px-6">
      {/* Left: App Icon & Name */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="EASY SFX" className="h-10 w-10 object-contain" />
        <span className="text-xl font-black tracking-tighter text-tint">EASY SFX</span>
      </div>

      {/* Center: Tabs */}
      <div className="flex items-center gap-1 rounded-full bg-black/20 p-1">
        {(['library', 'favorite', 'playlist'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              px-6 py-1.5 text-xs font-black uppercase tracking-widest transition-all rounded-full
              ${activeTab === tab 
                ? 'bg-tint text-zinc-950 shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'}
            `}
          >
            {t.nav?.[tab]}
          </button>
        ))}
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-4 text-secondary">
        <button 
          onClick={onSettingsClick}
          title={t.nav?.settings} 
          className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/5 hover:text-tint transition-all text-lg"
        >
          ⚙️
        </button>
      </div>
    </nav>
  )
}

export default Navbar
