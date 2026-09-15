"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const worldMenus = [
  { name: "Quests", icon: "⚑" }, { name: "Cards", icon: "▱" },
  { name: "Items", icon: "▣" }, { name: "Relics", icon: "◇" },
  { name: "Events", icon: "◷" }, { name: "News", icon: "▤" },
  { name: "Players", icon: "♙" }, { name: "Game Config", icon: "⚙" },
  { name: "Shop", icon: "◈" },
  { name: "Presents", icon: "🎁" },
];
const masterDataMenus = [
  { name: "Realms", icon: "◉" }, { name: "Rarity", icon: "◆" },
  { name: "Item Effects", icon: "✦" },
  { name: "Card Skills", icon: "⚔" },
];
const slug = (name: string) => name.toLowerCase().replaceAll(" ", "-");

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  function toggleSidebar() {
    const collapsed = document.documentElement.dataset.sidebar !== "collapsed";
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
    try { localStorage.setItem("aluthra-sidebar", collapsed ? "collapsed" : "expanded"); } catch {}
  }
  const renderMenu = ({ name, icon }: { name: string; icon: string }) => {
    const href = `/admin/${slug(name)}`;
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return <Link key={name} href={href} title={name} aria-label={name} aria-current={active ? "page" : undefined} className={active ? "active" : ""} onClick={() => setOpen(false)}><span aria-hidden="true">{icon}</span><span className="menu-label">{name}</span></Link>;
  };
  return <aside className="sidebar">
    <div className="sidebar-heading"><Link className="brand" href="/admin" aria-label="Aluthra home">✧ <span className="brand-name">ALUTHRA</span></Link><button type="button" className="sidebar-collapse secondary" onClick={toggleSidebar}><span className="collapse-label" aria-label="Minimize sidebar">«</span><span className="expand-label" aria-label="Expand sidebar">»</span></button><button className="secondary menu-toggle" aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button></div>
    <nav id="admin-nav" aria-label="Admin navigation" className={open ? "expanded" : ""}>
      <div className="sidebar-group"><p className="sidebar-group-title">World Management</p>{worldMenus.map(renderMenu)}</div>
      <div className="sidebar-group master-data-group"><p className="sidebar-group-title">Master Data</p>{masterDataMenus.map(renderMenu)}</div>
    </nav>
    <p className="sidebar-footer">ALUTHRA CONTROL CENTER</p>
  </aside>;
}
