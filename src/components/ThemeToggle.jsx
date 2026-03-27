import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('ft_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ft_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost"
      title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
      data-testid="btn-theme-toggle"
      style={{
        width: '44px', height: '44px', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', background: 'var(--bg-card)',
        border: '1px solid var(--border)', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'var(--transition)'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {theme === 'dark' ? <Sun size={20} color="var(--amber)" /> : <Moon size={20} color="var(--purple)" />}
    </button>
  );
}
