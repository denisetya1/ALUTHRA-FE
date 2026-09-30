"use client";

import { useParams } from "next/navigation";
import { useItemEffects } from "@/hooks/use-master-data";
import { useRelic } from "@/hooks/use-relics";
import RelicForm from "./relic-form";
import { PageError, PageLoading } from "@/components/admin/page-state";

export function RelicCreateLoader() {
  const effects = useItemEffects();
  if (effects.isPending) return <PageLoading label="Loading relic form…"/>;
  if (effects.isError) return <PageError message="Unable to load item effects."/>;
  return <RelicForm effects={(effects.data?.data ?? []).filter((x) => x.is_active)}/>;
}

export default function RelicEditorLoader() {
  const id = String(useParams<{ id: string }>().id || ""); const relic = useRelic(id); const effects = useItemEffects();
  if (relic.isPending || effects.isPending) return <PageLoading label="Loading relic…"/>;
  if (relic.isError || effects.isError || !relic.data) return <PageError message="Unable to load relic."/>;
  return <RelicForm mode="edit" relicId={id} initialValues={relic.data} effects={(effects.data?.data ?? []).filter((x) => x.is_active)} />;
}
