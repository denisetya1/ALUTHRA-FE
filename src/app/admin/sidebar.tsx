"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Badge,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Gift,
  Layers3,
  Newspaper,
  Package,
  PanelsTopLeft,
  ScrollText,
  Settings,
  Shield,
  ShoppingBag,
  Swords,
  Users,
  type LucideIcon,
} from "lucide-react";

const worldMenus = [
  { name: "Quests", icon: ScrollText }, { name: "Cards", icon: PanelsTopLeft },
  { name: "Items", icon: Package }, { name: "Relics", icon: Shield },
  { name: "Events", icon: CalendarDays, comingSoon: true }, { name: "News", icon: Newspaper, comingSoon: true },
  { name: "Players", icon: Users }, { name: "Game Config", icon: Settings },
  { name: "Shop", icon: ShoppingBag },
  { name: "Presents", icon: Gift },
];
const masterDataMenus = [
  { name: "Realms", icon: Globe2 }, { name: "Rarity", icon: Layers3 },
  { name: "Item Effects", icon: Badge },
  { name: "Card Skills", icon: Swords },
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
  const renderMenu = ({ name, icon: Icon, comingSoon = false }: { name: string; icon: LucideIcon; comingSoon?: boolean }) => {
    const href = `/admin/${slug(name)}`;
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return <Link key={name} href={href} title={comingSoon ? `${name}, coming soon` : name} aria-label={comingSoon ? `${name}, coming soon` : name} aria-current={active ? "page" : undefined} className={active ? "active" : ""} onClick={() => setOpen(false)}><Icon className="menu-icon" aria-hidden="true"/><span className="menu-label">{name}{comingSoon && <small className="coming-soon">Coming soon</small>}</span></Link>;
  };
  return <aside className="sidebar">
    <div className="sidebar-heading"><Link className="brand" href="/admin" aria-label="Aluthra home"><span className="realm-mark" aria-hidden="true">A</span><span className="brand-name">ALUTHRA</span></Link><button type="button" className="sidebar-collapse secondary" onClick={toggleSidebar} aria-label="Toggle sidebar"><ChevronLeft className="collapse-label" aria-hidden="true"/><ChevronRight className="expand-label" aria-hidden="true"/></button><button className="secondary menu-toggle" aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button></div>
    <nav id="admin-nav" aria-label="Admin navigation" className={open ? "expanded" : ""}>
      <div className="sidebar-group"><p className="sidebar-group-title">World</p>{worldMenus.map(renderMenu)}</div>
      <div className="sidebar-group master-data-group"><p className="sidebar-group-title">Reference data</p>{masterDataMenus.map(renderMenu)}</div>
    </nav>
    <p className="sidebar-footer">Aluthra control center</p>
  </aside>;
}
