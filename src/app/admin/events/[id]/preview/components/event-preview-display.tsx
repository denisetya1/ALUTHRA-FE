import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PREVIEW_LABELS, rewardLabel } from "@/lib/event-preview";
import type { EventDefinition, EventReward, EventUnlock } from "@/types/events";

export function EventPreviewHeader({ event, countdown }: { event: EventDefinition; countdown: string }) {
  return (
<Card className="overflow-hidden">
      {event.banner_image && <Image unoptimized width={1200} height={400} src={event.banner_image} alt={`${event.name_english} banner`} className="max-h-64 w-full object-cover" />}
      <CardHeader><div className="flex items-center gap-3">{event.icon_image && <Image unoptimized width={56} height={56} src={event.icon_image} alt={`${event.name_english} icon`} className="size-14 object-contain" />}<div><CardTitle className="text-2xl">{event.name_english}</CardTitle>{event.name_indonesia && <p className="text-sm text-muted-foreground">{event.name_indonesia}</p>}</div></div></CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm font-medium">{countdown} · Status: {event.status}</p>
        <p className="break-words text-sm text-muted-foreground">Schedule (UTC): {event.start_at} → {event.end_at}</p>
        <p>{event.description_short_english}</p><p className="whitespace-pre-wrap text-sm">{event.description_english}</p>
        <p className="text-sm text-muted-foreground">Minimum level: {event.min_player_level ?? 1} · Realms: {event.realm_restriction?.length ? event.realm_restriction.join(", ") : "All"}</p>
        {event.background_image && <details><summary className="cursor-pointer text-sm font-medium">Configured background</summary><Image unoptimized width={1200} height={800} src={event.background_image} alt={`${event.name_english} background`} className="mt-3 max-h-72 w-full rounded-md object-contain" /></details>}
      </CardContent>
    </Card>
  );
}

function Rewards({ rewards, label }: { rewards: EventReward[]; label: string }) {
  return <div className="grid gap-1"><h3 className="text-sm font-medium">{label}</h3>{rewards?.length ? <ul className="list-inside list-disc text-sm text-muted-foreground">{rewards.map((reward, index) => <li key={index}>{rewardLabel(reward)}</li>)}</ul> : <p className="text-sm text-muted-foreground">No rewards configured.</p>}</div>;
}

function unlockLabel(unlock: EventUnlock) {
  switch (unlock?.type) {
    case "previous_stage": return `Clear stage ${unlock.stage_number ?? "immediately before this one"}`;
    case "player_level": return `Player level ${unlock.level ?? "not configured"}`;
    case "event_points": return `${unlock.points ?? "Not configured"} event points`;
    case "mission": return `Complete mission ${unlock.mission_code ?? "not configured"}`;
    case "datetime": return `Available at ${unlock.at ?? "not configured"}`;
    default: return "No unlock condition";
  }
}

export function EventPreviewDisplay({ event, tab }: { event: EventDefinition; tab: keyof typeof PREVIEW_LABELS }) {
  const entries = tab === "story" ? event.stages : tab === "missions" ? event.missions : tab === "shop" ? event.shop_items : tab === "currency" ? event.currencies : event.milestones;
  if (!entries?.length) return <p className="rounded-lg border border-dashed border-border p-6 text-muted-foreground">No {tab === "shop" ? "shop offers" : tab === "story" ? "story stages" : tab} configured.</p>;
  return <div className="grid gap-4">
    {tab === "story" && [...event.stages].sort((a, b) => a.stage_number - b.stage_number).map((stage) => <Card key={stage.stage_number}><CardHeader><CardTitle>Stage {stage.stage_number} — {stage.name_english}</CardTitle></CardHeader><CardContent className="grid gap-4">
      <p className="whitespace-pre-wrap text-sm">{stage.description_english}</p><p className="whitespace-pre-wrap">{stage.story_text_english}</p>
      <p className="text-sm text-muted-foreground">{stage.difficulty} · Energy {stage.energy_cost ?? 0} · Recommended power {stage.recommended_power ?? 0} · {stage.repeatable ? "Repeatable" : "One-time"}</p>
      <p className="text-sm">{unlockLabel(stage.unlock)}</p>
      {stage.enemy_ids?.length ? <p className="break-all text-sm">Enemy cards: {stage.enemy_ids.join(", ")}</p> : null}
      <Rewards rewards={stage.first_clear_rewards} label="First clear rewards" /><Rewards rewards={stage.repeat_rewards} label="Repeat rewards" />
    </CardContent></Card>)}
    {tab === "missions" && event.missions.map((mission) => <Card key={mission.mission_code}><CardHeader><CardTitle>{mission.name_english}</CardTitle></CardHeader><CardContent className="grid gap-3"><p>{mission.description_english}</p><p className="text-sm text-muted-foreground">{mission.condition.type} · Target {mission.condition.target} · {mission.points ?? 0} points · Reset: {mission.reset_type}</p><Rewards rewards={mission.rewards} label="Rewards" /></CardContent></Card>)}
    {tab === "shop" && [...event.shop_items].sort((a, b) => a.display_order - b.display_order).map((offer, index) => <Card key={index}><CardHeader><CardTitle>Offer {index + 1} · {offer.price} {offer.currency_code}</CardTitle></CardHeader><CardContent className="grid gap-3"><p className="text-sm">Purchase limit: {offer.purchase_limit || "Unlimited"} · Daily limit: {offer.daily_limit || "Unlimited"}</p><p className="text-sm">{unlockLabel(offer.unlock)}</p>{(offer.available_from || offer.available_until) && <p className="text-sm">{offer.available_from ?? "Event start"} → {offer.available_until ?? "Event end"}</p>}<Rewards rewards={offer.rewards} label="Exchange rewards" /></CardContent></Card>)}
    {tab === "currency" && event.currencies.map((currency) => <Card key={currency.currency_code}><CardHeader><CardTitle>{currency.name_english}</CardTitle></CardHeader><CardContent className="grid gap-2">{currency.icon_image && <Image unoptimized width={48} height={48} src={currency.icon_image} alt={`${currency.name_english} icon`} className="size-12 object-contain" />}<p className="text-sm">{currency.currency_code} · Max carry: {currency.max_carry || "Unlimited"} · Grace period: {currency.grace_period_days ?? 0} days</p></CardContent></Card>)}
    {tab === "milestones" && [...event.milestones].sort((a, b) => a.display_order - b.display_order).map((milestone, index) => <Card key={index}><CardHeader><CardTitle>{milestone.required_points} event points</CardTitle></CardHeader><CardContent className="grid gap-3"><p className="text-sm">{milestone.claimable ? "Claimable" : "Not claimable"}</p><Rewards rewards={milestone.rewards} label="Milestone rewards" /></CardContent></Card>)}
  </div>;
}
