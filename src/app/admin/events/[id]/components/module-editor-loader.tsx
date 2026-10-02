"use client";

import { useParams } from "next/navigation";
import { useEvent } from "@/hooks/use-events";
import { PageLoading, PageError } from "@/components/admin/page-state";
import { EventEditorNav } from "../../components/event-editor-nav";

/** Shared loader for per-module editor pages: fetches the event and renders the editor body. */
export function ModuleEditorLoader({ children }: { children: (event: NonNullable<ReturnType<typeof useEvent>["data"]>) => React.ReactNode }) {
  const { id = "" } = useParams<{ id: string }>();
  const query = useEvent(id);
  if (query.isPending) return <PageLoading label="Loading event…" />;
  if (query.isError || !query.data) return <PageError message="Unable to load event." />;
  return (
    <div className="grid gap-6">
      <EventEditorNav event={query.data} />
      {children(query.data)}
    </div>
  );
}
