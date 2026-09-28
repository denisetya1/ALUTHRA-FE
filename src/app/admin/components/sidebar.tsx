"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
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
  const collapsed = useSyncExternalStore(
    (notify) => { window.addEventListener("storage", notify); window.addEventListener("aluthra-sidebar", notify); return () => { window.removeEventListener("storage", notify); window.removeEventListener("aluthra-sidebar", notify); }; },
    () => localStorage.getItem("aluthra-sidebar") === "collapsed",
    () => false,
  );
  function toggleSidebar() {
    const next = !collapsed;
    document.documentElement.dataset.sidebar = next ? "collapsed" : "expanded";
    try { localStorage.setItem("aluthra-sidebar", next ? "collapsed" : "expanded"); window.dispatchEvent(new Event("aluthra-sidebar")); } catch {}
  }
  const renderMenu = ({ name, icon: Icon, comingSoon = false }: { name: string; icon: LucideIcon; comingSoon?: boolean }) => {
    const href = `/admin/${slug(name)}`;
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return <Link key={name} href={href} title={comingSoon ? `${name}, coming soon` : name} aria-label={comingSoon ? `${name}, coming soon` : name} aria-current={active ? "page" : undefined} className={`my-0.5 flex min-h-10 items-center rounded-lg border border-transparent px-3 py-2.5 text-[13px] transition-colors ${collapsed ? "justify-center gap-0 px-2 py-3" : "gap-3"} ${active ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary-soft-foreground)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`} onClick={() => setOpen(false)}><Icon className="size-[18px] shrink-0" aria-hidden="true"/>{!collapsed && <span className="text-left text-[13px]">{name}{comingSoon && <small className="mt-0.5 block text-[9px] font-medium leading-tight text-muted-foreground">Coming soon</small>}</span>}</Link>;
  };
  return <aside className={`sticky top-0 flex h-svh shrink-0 flex-col border-r border-border bg-background px-3 py-[22px] transition-[width] max-[800px]:relative max-[800px]:h-auto max-[800px]:w-full max-[800px]:p-5 ${collapsed ? "w-[68px] px-2" : "w-[226px]"}`}>
    <div className="relative flex items-center justify-between"><Link className={`flex items-center gap-3 px-2 text-[19px] font-bold tracking-[2px] text-foreground ${collapsed ? "justify-center" : ""}`} href="/admin" aria-label="Aluthra home"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-primary/40 bg-[var(--primary-soft)] text-sm font-bold text-primary" aria-hidden="true">A</span>{!collapsed && <span>ALUTHRA</span>}</Link><button type="button" className="absolute -right-[33px] top-0 z-20 grid size-7 place-items-center rounded-md border border-border bg-background text-foreground hover:bg-muted max-[800px]:hidden" onClick={toggleSidebar} aria-label="Toggle sidebar">{collapsed ? <ChevronRight className="size-4" aria-hidden="true"/> : <ChevronLeft className="size-4" aria-hidden="true"/>}</button><button className="hidden min-h-11 rounded-md border border-border bg-background px-4 text-sm text-foreground hover:bg-muted max-[800px]:block" aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button></div>
    <nav id="admin-nav" aria-label="Admin navigation" className={`mt-8 overflow-auto max-[800px]:mt-6 ${open ? "max-[800px]:block" : "max-[800px]:hidden"}`}>
      <div>{!collapsed && <p className="mx-3 mb-2.5 text-[9px] font-semibold uppercase tracking-[1.4px] text-muted-foreground">World</p>}{worldMenus.map(renderMenu)}</div>
      <div className="mt-6 border-t border-border pt-5">{!collapsed && <p className="mx-3 mb-2.5 text-[9px] font-semibold uppercase tracking-[1.4px] text-muted-foreground">Reference data</p>}{masterDataMenus.map(renderMenu)}</div>
    </nav>
    {!collapsed && <p className="mt-auto pt-8 text-[10px] text-muted-foreground max-[800px]:hidden">Aluthra control center</p>}
  </aside>;
}
