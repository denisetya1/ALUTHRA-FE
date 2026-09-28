"use client";

import { useParams } from "next/navigation";
import { useItemEffects } from "@/hooks/use-master-data";
import { useRelic } from "@/hooks/use-relics";
import RelicForm, { type RelicDefaults } from "./relic-form";

export function RelicCreateLoader() {
  const effects = useItemEffects();
  if (effects.isPending) return <p>Loading relic form…</p>;
  if (effects.isError) return <p className="text-sm text-destructive">Unable to load item effects.</p>;
  return <RelicForm effects={(effects.data?.data ?? []).filter((x) => x.is_active)}/>;
}

export default function RelicEditorLoader() {
  const id = String(useParams<{ id: string }>().id || ""); const relic = useRelic(id); const effects = useItemEffects();
  if (relic.isPending || effects.isPending) return <p>Loading relic…</p>;
  if (relic.isError || effects.isError || !relic.data) return <p className="text-sm text-destructive">Unable to load relic.</p>;
  return <RelicForm mode="edit" relicId={id} initialValues={relic.data as unknown as RelicDefaults} effects={(effects.data?.data ?? []).filter((x) => x.is_active)} />;
}
