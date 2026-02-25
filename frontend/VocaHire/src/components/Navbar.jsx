import React from 'react';
import { Languages, Sun, Moon, Bell } from 'lucide-react';

export default function Navbar({ lang, setLang, isDarkMode, toggleTheme, t }) {
  const isRTL = lang === 'ar';
  
  return (
    <nav className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-light)] bg-[var(--bg-primary)] sticky top-0 z-10 backdrop-blur-md">
      {/* Logo section - stays on the left for LTR, right for RTL */}
      <div className={`flex items-center ${isRTL ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[10px] text-white font-black">
            VH
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            {t.brand}
          </span>
        </div>
      </div>
      
      {/* Actions section - stays on the right for LTR, left for RTL */}
      <div className={`flex items-center gap-1 ${isRTL ? 'order-1' : 'order-2'}`}>
        <button
          onClick={() => setLang(l => l === 'en' ? 'fr' : l === 'fr' ? 'ar' : 'en')}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
        >
          <Languages size={18} />
          <span className="text-[10px] font-bold uppercase">{lang}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
          <Bell size={18} />
        </button>
      </div>
    </nav>
  );
}