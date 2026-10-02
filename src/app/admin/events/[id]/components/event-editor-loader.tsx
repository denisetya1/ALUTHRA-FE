"use client";

import { useParams } from "next/navigation";
import { useEvent } from "@/hooks/use-events";
import { toLocalDateTime } from "@/lib/event-editor-fields";
import { PageLoading, PageError } from "@/components/admin/page-state";
import EventOverviewForm, { type EventOverviewDefaults } from "./event-overview-form";
import { EventEditorNav } from "../../components/event-editor-nav";

export default function EventEditorLoader() {
  const { id = "" } = useParams<{ id: string }>();
  const query = useEvent(id);
  if (query.isPending) return <PageLoading label="Loading event…" />;
  if (query.isError || !query.data) return <PageError message="Unable to load event." />;
  const event = query.data;
  const initialValues: EventOverviewDefaults = {
    code: event.code,
    name_english: event.name_english,
    name_indonesia: event.name_indonesia ?? "",
    description_short_english: event.description_short_english ?? "",
    description_short_indonesia: event.description_short_indonesia ?? "",
    description_english: event.description_english ?? "",
    description_indonesia: event.description_indonesia ?? "",
    start_at: toLocalDateTime(event.start_at),
    end_at: toLocalDateTime(event.end_at),
    visibility_start_at: toLocalDateTime(event.visibility_start_at),
    visibility_end_at: toLocalDateTime(event.visibility_end_at),
    min_player_level: event.min_player_level,
    realm_restriction: event.realm_restriction ?? [],
    banner_image: event.banner_image ?? "",
    background_image: event.background_image ?? "",
    icon_image: event.icon_image ?? "",
    priority: event.priority ?? 0,
    featured: event.featured ?? false,
    tags: event.tags ?? [],
    modules: event.modules,
  };
  return (
    <div className="grid gap-6">
      <EventEditorNav event={event} />
      <EventOverviewForm eventId={event._id} status={event.status} initialValues={initialValues} />
    </div>
  );
}
