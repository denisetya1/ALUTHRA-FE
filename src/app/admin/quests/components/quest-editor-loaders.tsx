"use client";

import { useParams } from "next/navigation";
import { useQuestArc, useQuestChapter, useQuestItem, useQuestRegion } from "@/hooks/use-quests";
import ContentForm, { emptyContent, type ContentValues } from "./content-form";
import RegionForm from "./region-form";
import { PageError, PageLoading } from "@/components/admin/page-state";

const Loading = () => <PageLoading label="Loading content…"/>;
const Failed = () => <PageError message="Unable to load content."/>;
const contentValues = (data: Partial<ContentValues> & { realms?: string[] }): ContentValues => ({ ...emptyContent, ...data, realms_text: data.realms?.join(", ") || data.realms_text || "" });

export function ArcEditorLoader() {
  const { arcId = "" } = useParams<{ arcId: string }>(); const query = useQuestArc(arcId);
  if (query.isPending) return <Loading/>; if (query.isError || !query.data) return <Failed/>;
  return <ContentForm level="arc" mode="edit" endpoint={`/api/admin/quests/arcs/${arcId}`} back="/admin/quests" initialValues={contentValues(query.data)}/>;
}

export function ChapterEditorLoader() {
  const { arcId = "", chapterId = "" } = useParams<{ arcId: string; chapterId: string }>(); const query = useQuestChapter(chapterId);
  if (query.isPending) return <Loading/>; if (query.isError || !query.data) return <Failed/>;
  return <ContentForm level="chapter" mode="edit" endpoint={`/api/admin/quests/chapters/${chapterId}`} back={`/admin/quests/${arcId}`} initialValues={contentValues(query.data)}/>;
}

export function RegionEditorLoader() {
  const { arcId = "", chapterId = "", regionId = "" } = useParams<{ arcId: string; chapterId: string; regionId: string }>(); const query = useQuestRegion(regionId);
  if (query.isPending) return <Loading/>; if (query.isError || !query.data) return <Failed/>;
  const region = query.data;
  return <RegionForm mode="edit" arcId={arcId} chapterId={chapterId} regionId={regionId} initialValues={{ source_id: region.source_id, order_number: region.order_number, name_english: region.name_english, name_indonesia: region.name_indonesia, description_english: region.description_english || "", description_indonesia: region.description_indonesia || "", scope: region.scope, realms_text: region.realms?.join(", ") || "", requirement: region.requirement, image: region.image || "", image_file: undefined, show: region.show }}/>
}

export function QuestEditorLoader() {
  const { arcId = "", chapterId = "", regionId = "", questId = "" } = useParams<{ arcId: string; chapterId: string; regionId: string; questId: string }>(); const query = useQuestItem(questId);
  if (query.isPending) return <Loading/>; if (query.isError || !query.data) return <Failed/>;
  return <ContentForm level="quest" mode="edit" endpoint={`/api/admin/quests/items/${questId}`} back={`/admin/quests/${arcId}/${chapterId}/${regionId}`} initialValues={contentValues(query.data)}/>
}
