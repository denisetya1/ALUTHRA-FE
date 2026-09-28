'use client';

export default function ThemeToggle() {
  function toggle() {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('aluthra-theme', theme); } catch {}
  }

  return <button className="fixed right-6 top-6 z-50 min-h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground hover:bg-muted max-[800px]:bottom-5 max-[800px]:right-5 max-[800px]:top-auto max-[800px]:min-h-11" onClick={toggle} type="button"><span className="dark:hidden">☾ <span className="ml-1.5">Dark mode</span></span><span className="hidden dark:inline">☀ <span className="ml-1.5">Light mode</span></span></button>;
}
