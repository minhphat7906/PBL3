import React, { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Monitor, Palette, X, Check } from 'lucide-react';

const THEMES = [
  { id: 'indigo',  name: 'Indigo',   primary: '#4f46e5', light: '#e0e7ff', dark: '#312e81', glow: 'rgba(79,70,229,0.4)' },
  { id: 'violet',  name: 'Violet',   primary: '#7c3aed', light: '#ede9fe', dark: '#4c1d95', glow: 'rgba(124,58,237,0.4)' },
  { id: 'emerald', name: 'Emerald',  primary: '#10b981', light: '#d1fae5', dark: '#064e3b', glow: 'rgba(16,185,129,0.4)' },
  { id: 'rose',    name: 'Rose',     primary: '#f43f5e', light: '#ffe4e6', dark: '#881337', glow: 'rgba(244,63,94,0.4)'  },
  { id: 'orange',  name: 'Orange',   primary: '#f97316', light: '#ffedd5', dark: '#7c2d12', glow: 'rgba(249,115,22,0.4)' },
  { id: 'sky',     name: 'Sky Blue', primary: '#0ea5e9', light: '#e0f2fe', dark: '#0c4a6e', glow: 'rgba(14,165,233,0.4)' },
];

const MODES = [
  { id: 'light',  label: 'Sáng',   icon: <Sun size={16} /> },
  { id: 'dark',   label: 'Tối',    icon: <Moon size={16} /> },
  { id: 'system', label: 'Hệ thống', icon: <Monitor size={16} /> },
];

const applyColorTheme = (themeId) => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  root.style.setProperty('--theme-primary',       theme.primary);
  root.style.setProperty('--theme-primary-light',  theme.light);
  root.style.setProperty('--theme-primary-dark',   theme.dark);
  root.style.setProperty('--theme-glow',           theme.glow);
  THEMES.forEach(t => root.classList.remove(`theme-${t.id}`));
  if (themeId !== 'indigo') root.classList.add(`theme-${themeId}`);
  localStorage.setItem('app-theme', themeId);
};

const applyDisplayMode = (mode) => {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (mode === 'dark' || (mode === 'system' && prefersDark)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('app-display-mode', mode);
};

const ThemeSwitcher = ({ mode = 'floating' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [colorTheme, setColorTheme] = useState('indigo');
  const [displayMode, setDisplayMode] = useState('light');
  const menuRef = useRef(null);

  useEffect(() => {
    const savedColor = localStorage.getItem('app-theme') || 'indigo';
    const savedMode  = localStorage.getItem('app-display-mode') || 'light';
    setColorTheme(savedColor);
    setDisplayMode(savedMode);
    applyColorTheme(savedColor);
    applyDisplayMode(savedMode);

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColor = (id) => {
    setColorTheme(id);
    applyColorTheme(id);
  };

  const handleMode = (id) => {
    setDisplayMode(id);
    applyDisplayMode(id);
  };

  const currentThemeObj = THEMES.find(t => t.id === colorTheme) || THEMES[0];

  return (
    <div className={mode === 'floating' ? "fixed bottom-6 right-6 z-50" : "relative"} ref={menuRef}>
      {/* Nút Trigger */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-200 dark:border-slate-700
          ${mode === 'floating' 
            ? 'w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:rotate-[20deg] shadow-xl' 
            : 'p-2.5 glass-card glow-hover rounded-xl text-slate-600 dark:text-slate-400'}
          ${isOpen ? 'ring-2 ring-[var(--theme-primary)] scale-105 rotate-0' : ''}`}
        title="Tuỳ chỉnh giao diện"
      >
        <Palette size={mode === 'floating' ? 22 : 20} className={isOpen ? 'text-[var(--theme-primary)]' : ''} />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className={`absolute w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700/80 p-5 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-200
          ${mode === 'floating' ? 'bottom-16 right-0' : 'top-full right-0 mt-3'}`}>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm">Giao diện</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Tùy chỉnh màu sắc & chế độ</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">Hiển thị</p>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleMode(m.id)}
                  className={`flex flex-col items-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    displayMode === m.id
                      ? 'text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  style={displayMode === m.id ? { backgroundColor: currentThemeObj.primary } : {}}
                >
                  {m.icon}
                  <span className="text-[10px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">Bảng màu</p>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleColor(t.id)}
                  className="relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all hover:scale-105"
                  style={{
                    borderColor: colorTheme === t.id ? t.primary : 'transparent',
                    backgroundColor: colorTheme === t.id ? `${t.primary}10` : undefined,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full shadow-md flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.dark})` }}
                  >
                    {colorTheme === t.id && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: colorTheme === t.id ? t.primary : undefined }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-1 rounded-full overflow-hidden flex">
             <div className="flex-1" style={{ backgroundColor: currentThemeObj.primary }}></div>
             <div className="flex-1" style={{ backgroundColor: currentThemeObj.dark }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
