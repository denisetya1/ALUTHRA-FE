"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Check, CircleDashed } from "lucide-react";
import { MODULE_LABELS, EVENT_MODULE_KEYS } from "@/schemas/event";
import type { EventDefinition } from "@/types/events";

const NAV = [
  { segment: "edit", label: "Overview" },
  { segment: "story", label: "Story", module: "story" },
  { segment: "missions", label: "Missions", module: "missions" },
  { segment: "currency", label: "Currency", module: "currency" },
  { segment: "shop", label: "Exchange Shop", module: "shop" },
  { segment: "milestones", label: "Milestones", module: "milestones" },
  { segment: "preview", label: "Preview" },
] as const;

function completion(event: EventDefinition, segment: string): "done" | "incomplete" | "off" | undefined {
  const nav = NAV.find((item) => item.segment === segment);
  if (!nav || !("module" in nav) || !nav.module) return undefined;
  const moduleKey = nav.module as keyof EventDefinition["modules"];
  if (!event.modules[moduleKey]) return "off";
  const counts: Record<string, number> = {
    story: event.stages?.length ?? 0,
    missions: event.missions?.length ?? 0,
    currency: event.currencies?.length ?? 0,
    shop: event.shop_items?.length ?? 0,
    milestones: event.milestones?.length ?? 0,
  };
  return (counts[nav.module] ?? 0) > 0 ? "done" : "incomplete";
}

function CompletionMark({ state }: { state: "done" | "incomplete" | "off" | undefined }) {
  if (state === "done") return <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-label="configured" />;
  if (state === "incomplete") return <AlertTriangle className="size-3.5 text-amber-500" aria-label="enabled but empty" />;
  if (state === "off") return <CircleDashed className="size-3.5 text-muted-foreground" aria-label="module disabled" />;
  return null;
}

export function EventEditorNav({ event }: { event: EventDefinition }) {
  const pathname = usePathname();
  const base = `/admin/events/${event._id}`;
  return (
    <nav aria-label="Event editor sections" className="sticky top-0 z-10 -mx-1 flex gap-1 overflow-x-auto border-b border-border bg-background px-1 pb-2 pt-1">
      {NAV.map((item) => {
        const href = `${base}/${item.segment}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={item.segment}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
              active ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary-soft-foreground)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.label}
            {"module" in item && item.module && <CompletionMark state={completion(event, item.segment)} />}
          </Link>
        );
      })}
    </nav>
  );
}

export { EVENT_MODULE_KEYS, MODULE_LABELS };
