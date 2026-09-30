"use client";

import { useParams } from "next/navigation";
import { useCardOptions, useItemOptions, usePlayerOptions } from "@/hooks/use-admin-options";
import { usePresent } from "@/hooks/use-presents";
import PresentForm from "./present-form";
import { PageError, PageLoading } from "@/components/admin/page-state";

export default function PresentEditorLoader({ create = false }: { create?: boolean }) {
  const id = String(useParams<{ id?: string }>().id || ""); const present = usePresent(create ? "" : id); const items = useItemOptions(); const cards = useCardOptions(); const players = usePlayerOptions();
  if ([items, cards, players].some((q) => q.isPending) || (!create && present.isPending)) return <PageLoading label="Loading present form…"/>;
  if ([items, cards, players].some((q) => q.isError) || (!create && (present.isError || !present.data))) return <PageError message="Unable to load present."/>;
  const options = { items: items.data?.data ?? [], cards: cards.data?.data ?? [], players: players.data?.data ?? [] };
  if (create) return <PresentForm {...options} />;
  return <PresentForm mode="edit" presentId={id} initialValues={present.data} {...options} />;
}
