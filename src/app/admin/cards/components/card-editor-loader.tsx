"use client";

import { useParams } from "next/navigation";
import { useCard } from "@/hooks/use-cards";
import { useCardSkills, useRarities, useRealms } from "@/hooks/use-master-data";
import { useItemOptions } from "@/hooks/use-admin-options";
import CardForm from "./card-form";
import { PageError, PageLoading } from "@/components/admin/page-state";

export function CardCreateLoader() {
  const realms = useRealms(); const rarities = useRarities(); const skills = useCardSkills(); const items = useItemOptions();
  if ([realms, rarities, skills, items].some((query) => query.isPending)) return <PageLoading label="Loading card form…"/>;
  if ([realms, rarities, skills, items].some((query) => query.isError)) return <PageError message="Unable to load card options."/>;
  return <CardForm realms={(realms.data?.data ?? []).filter((x) => x.is_active)} rarities={(rarities.data?.data ?? []).filter((x) => x.is_active)} skills={(skills.data?.data ?? []).filter((x) => x.is_active)} items={items.data?.data ?? []}/>;
}

export default function CardEditorLoader({ mode }: { mode: "edit" | "duplicate" }) {
  const id = String(useParams<{ id: string }>().id || "");
  const card = useCard(id); const realms = useRealms(); const rarities = useRarities(); const skills = useCardSkills(); const items = useItemOptions();
  if ([card, realms, rarities, skills, items].some((query) => query.isPending)) return <PageLoading label="Loading card…"/>;
  if ([card, realms, rarities, skills, items].some((query) => query.isError) || !card.data) return <PageError message="Unable to load card."/>;
  return <CardForm mode={mode} cardId={mode === "edit" ? id : undefined} initialValues={card.data} realms={(realms.data?.data ?? []).filter((x) => x.is_active)} rarities={(rarities.data?.data ?? []).filter((x) => x.is_active)} skills={(skills.data?.data ?? []).filter((x) => x.is_active)} items={items.data?.data ?? []} />;
}
