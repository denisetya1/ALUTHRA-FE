"use client";

import { useParams } from "next/navigation";
import { useCard } from "@/hooks/use-cards";
import { useCardSkills, useRarities, useRealms } from "@/hooks/use-master-data";
import { useItemOptions } from "@/hooks/use-admin-options";
import CardForm, { type CardDefaults } from "./card-form";

export function CardCreateLoader() {
  const realms = useRealms(); const rarities = useRarities(); const skills = useCardSkills(); const items = useItemOptions();
  if ([realms, rarities, skills, items].some((query) => query.isPending)) return <p>Loading card form…</p>;
  if ([realms, rarities, skills, items].some((query) => query.isError)) return <p className="text-sm text-destructive">Unable to load card options.</p>;
  return <CardForm realms={(realms.data?.data ?? []).filter((x) => x.is_active)} rarities={(rarities.data?.data ?? []).filter((x) => x.is_active)} skills={(skills.data?.data ?? []).filter((x) => x.is_active)} items={items.data?.data ?? []}/>;
}

export default function CardEditorLoader({ mode }: { mode: "edit" | "duplicate" }) {
  const id = String(useParams<{ id: string }>().id || "");
  const card = useCard(id); const realms = useRealms(); const rarities = useRarities(); const skills = useCardSkills(); const items = useItemOptions();
  if ([card, realms, rarities, skills, items].some((query) => query.isPending)) return <p>Loading card…</p>;
  if ([card, realms, rarities, skills, items].some((query) => query.isError) || !card.data) return <p className="text-sm text-destructive">Unable to load card.</p>;
  return <CardForm mode={mode} cardId={mode === "edit" ? id : undefined} initialValues={card.data as unknown as CardDefaults} realms={(realms.data?.data ?? []).filter((x) => x.is_active)} rarities={(rarities.data?.data ?? []).filter((x) => x.is_active)} skills={(skills.data?.data ?? []).filter((x) => x.is_active)} items={items.data?.data ?? []} />;
}
