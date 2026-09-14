'use client';

export default function ThemeToggle() {
  function toggle() {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('aluthra-theme', theme); } catch {}
  }

  return <button className="theme-toggle" onClick={toggle} type="button"><span className="light-label">☾ <span>Dark mode</span></span><span className="dark-label">☀ <span>Light mode</span></span></button>;
}
