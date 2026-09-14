'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
export const menus = ['Quests', 'Cards', 'Items', 'Relics', 'Events', 'News', 'Players', 'Game Config'];
export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  function toggleSidebar() {
    const collapsed = document.documentElement.dataset.sidebar !== 'collapsed';
    document.documentElement.dataset.sidebar = collapsed ? 'collapsed' : 'expanded';
    try { localStorage.setItem('aluthra-sidebar', collapsed ? 'collapsed' : 'expanded'); } catch {}
  }
  return <aside className="sidebar"><div className="sidebar-heading"><Link className="brand" href="/admin" aria-label="Aluthra home">✧ <span className="brand-name">ALUTHRA</span></Link><button type="button" className="sidebar-collapse secondary" onClick={toggleSidebar}><span className="collapse-label" aria-label="Minimize sidebar">«</span><span className="expand-label" aria-label="Expand sidebar">»</span></button><button className="secondary menu-toggle" aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button></div><nav id="admin-nav" aria-label="Admin navigation" className={open ? 'expanded' : ''}><p className="eyebrow">WORLD MANAGEMENT</p>{menus.map((name, index) => { const href = `/admin/${name.toLowerCase().replace(' ', '-')}`; const active = pathname === href || pathname.startsWith(href + '/'); return <Link key={name} href={href} title={name} aria-label={name} aria-current={active ? 'page' : undefined} className={active ? 'active' : ''} onClick={() => setOpen(false)}><span aria-hidden="true">{['⚑', '▱', '▣', '◇', '◷', '▤', '♙', '⚙'][index]}</span><span className="menu-label">{name}</span></Link>; })}</nav><p className="sidebar-footer">ALUTHRA CONTROL CENTER</p></aside>;
}
