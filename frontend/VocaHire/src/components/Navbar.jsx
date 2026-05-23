import { useState, useRef, useEffect, useContext } from 'react';
import { Languages, Sun, Moon, Bell, User as UserIcon, LogOut, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../routes/AuthContext';

export default function Navbar({ lang, setLang, isDarkMode, toggleTheme, t }) {
  const isRTL = lang === 'ar';
  const navigate = useNavigate();
  const { setIsAuth } = useContext(AuthContext);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Read the user info that was saved at login (port.jsx -> localStorage.setItem('userData', ...))
  const userData = (() => {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const firstName = userData?.first_name || '';
  const lastName  = userData?.last_name  || '';
  const email     = userData?.email      || '';
  const initials  = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'U';

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userData');
    setIsAuth(false);
    setProfileOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-light)] bg-[var(--bg-primary)] sticky top-0 z-10 backdrop-blur-md">
      {/* Logo + navigation section */}
      <div className={`flex items-center gap-2 ${isRTL ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[10px] text-white font-black">
            VH
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            {t.brand}
          </span>
        </div>

        <div className={`flex items-center gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
          <button className="px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors rounded-md">
            {t.Accueil}
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors rounded-md"
            onClick={() => navigate("/session-management")}
          >
            {t.GestionDesSessions}
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors rounded-md">
            {t.GestionDesCandidats}
          </button>
        </div>
      </div>

      {/* Actions section */}
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

        {/* ----- Profile dropdown ----- */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs font-bold flex items-center justify-center hover:shadow-md transition-shadow"
            title={firstName ? `${firstName} ${lastName}` : 'Profile'}
          >
            {initials}
          </button>

          {profileOpen && (
            <div
              className={`absolute mt-2 w-64 rounded-md shadow-lg border border-[var(--border-light)] bg-[var(--bg-primary)] py-2 z-50
                          ${isRTL ? 'left-0' : 'right-0'}`}
            >
              {/* User info block */}
              <div className="px-4 py-3 border-b border-[var(--border-light)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-sm font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'User'}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate flex items-center gap-1">
                      <Mail size={11} /> {email || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <LogOut size={14} />
                {t.logout || 'Log out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}