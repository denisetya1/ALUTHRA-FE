"use client";

import { useParams } from "next/navigation";
import { useQuestArc, useQuestChapter, useQuestItem, useQuestRegion } from "@/hooks/use-quests";
import ContentForm, { emptyContent, type ContentValues } from "./content-form";
import RegionForm from "./region-form";
import type { RegionValues } from "@/schemas/region";

const Loading = () => <p>Loading content…</p>;
const Failed = () => <p className="text-sm text-destructive">Unable to load content.</p>;

export function ArcEditorLoader() {
  const { arcId = "" } = useParams<{ arcId: string }>(); const query = useQuestArc(arcId);
  if (query.isPending) return <Loading/>; if (query.isError || !query.data) return <Failed/>;
  return <ContentForm level="arc" mode="edit" endpoint={`/api/admin/quests/arcs/${arcId}`} back="/admin/quests" initialValues={{ ...emptyContent, ...query.data } as ContentValues}/>;
}

export function ChapterEditorLoader() {
  const { arcId = "", chapterId = "" } = useParams<{ arcId: string; chapterId: string }>(); const query = useQuestChapter(chapterId);
  if (query.isPending) return <Loading/>; if (query.isError || !query.data) return <Failed/>;
  return <ContentForm level="chapter" mode="edit" endpoint={`/api/admin/quests/chapters/${chapterId}`} back={`/admin/quests/${arcId}`} initialValues={{ ...emptyContent, ...query.data } as ContentValues}/>;
}

export function RegionEditorLoader() {
  const { arcId = "", chapterId = "", regionId = "" } = useParams<{ arcId: string; chapterId: string; regionId: string }>(); const query = useQuestRegion(regionId);
  if (query.isPending) return <Loading/>; if (query.isError || !query.data) return <Failed/>;
  const region = query.data as unknown as RegionValues & { realms?: string[] };
  return <RegionForm mode="edit" arcId={arcId} chapterId={chapterId} regionId={regionId} initialValues={{ source_id: region.source_id, order_number: region.order_number, name_english: region.name_english, name_indonesia: region.name_indonesia, description_english: region.description_english || "", description_indonesia: region.description_indonesia || "", scope: region.scope, realms_text: region.realms_text || region.realms?.join(", ") || "", requirement: region.requirement, image: region.image || "", image_file: undefined, show: region.show }}/>
}

export function QuestEditorLoader() {
  const { arcId = "", chapterId = "", regionId = "", questId = "" } = useParams<{ arcId: string; chapterId: string; regionId: string; questId: string }>(); const query = useQuestItem(questId);
  if (query.isPending) return <Loading/>; if (query.isError || !query.data) return <Failed/>;
  const raw = query.data as unknown as Partial<ContentValues> & { realms?: string[] };
  return <ContentForm level="quest" mode="edit" endpoint={`/api/admin/quests/items/${questId}`} back={`/admin/quests/${arcId}/${chapterId}/${regionId}`} initialValues={{ ...emptyContent, ...raw, realms_text: raw.realms?.join(", ") || "" }}/>
}
