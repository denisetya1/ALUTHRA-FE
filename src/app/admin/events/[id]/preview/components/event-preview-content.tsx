"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventValidation, usePublishEvent } from "@/hooks/use-events";
import { PREVIEW_LABELS, eventCountdown, previewTabs, publishBlockReason } from "@/lib/event-preview";
import type { EventDefinition } from "@/types/events";
import { ModuleEditorLoader } from "../../components/module-editor-loader";
import { ConfirmDialog } from "../../../components/confirm-dialog";
import { EventPreviewDisplay, EventPreviewHeader } from "./event-preview-display";

function Preview({ event }: { event: EventDefinition }) {
  const validation = useEventValidation(event._id);
  const publish = usePublishEvent();
  const [confirm, setConfirm] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const tabs = previewTabs(event);
  const [selected, setSelected] = useState<keyof typeof PREVIEW_LABELS | null>(null);
  const tab = selected && tabs.includes(selected) ? selected : tabs[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reason = validation.isError ? "Validation is unavailable. Retry before publishing." : publishBlockReason(event, validation.isFetching ? undefined : validation.data?.issues);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function confirmPublish() {
    if (reason || publish.isPending) return;
    try {
      await publish.mutateAsync({ id: event._id });
      setConfirm(false);
      toast.success("Event published. The schedule determines when it becomes active.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to publish event.");
    }
  }

  return <div className="grid gap-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold">Event preview</h1><p className="text-sm text-muted-foreground">Saved configuration only. This is not player progress or analytics.</p></div><Button disabled={Boolean(reason) || publish.isPending} onClick={() => { publish.reset(); setConfirm(true); }}>{publish.isPending ? "Publishing…" : "Publish event"}</Button></div>
    {reason && <p className="text-sm text-muted-foreground">{reason}</p>}
    <Card><CardHeader><CardTitle>Validation</CardTitle></CardHeader><CardContent className="grid gap-3">
      {validation.isPending || validation.isFetching ? <p role="status">Checking event configuration…</p> : validation.isError ? <div role="alert"><p>Unable to load validation issues.</p><Button variant="outline" onClick={() => validation.refetch()}>Retry validation</Button></div> : validation.data?.issues?.length ? <ul className="grid gap-2">{validation.data.issues.map((issue, index) => <li key={index} className={issue.level === "error" ? "text-sm text-destructive" : "text-sm text-amber-700 dark:text-amber-300"}><strong>{issue.level === "error" ? "Error" : "Warning"} · {issue.field}</strong>: {issue.message}</li>)}</ul> : <p className="text-sm">No validation issues found.</p>}
    </CardContent></Card>
    {publish.isError && <p role="alert" className="text-sm text-destructive">{publish.error instanceof Error ? publish.error.message : "Unable to publish event."}</p>}
    <EventPreviewHeader event={event} countdown={now === null ? "Loading countdown…" : eventCountdown(event, now)} />
    {tabs.length ? <section className="grid min-w-0 gap-4">
      <div role="tablist" aria-label="Configured event modules" className="flex gap-2 overflow-x-auto border-b border-border pb-2">{tabs.map((key, index) => <Button key={key} ref={(element) => { tabRefs.current[index] = element; }} id={`preview-tab-${key}`} role="tab" aria-selected={tab === key} aria-controls={`preview-panel-${key}`} tabIndex={tab === key ? 0 : -1} variant={tab === key ? "default" : "outline"} className="shrink-0" onClick={() => setSelected(key)} onKeyDown={(e) => {
        const next = e.key === "ArrowRight" ? (index + 1) % tabs.length : e.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
        if (next >= 0) { e.preventDefault(); setSelected(tabs[next]); tabRefs.current[next]?.focus(); }
      }}>{PREVIEW_LABELS[key]}</Button>)}</div>
      {tab && <div role="tabpanel" id={`preview-panel-${tab}`} aria-labelledby={`preview-tab-${tab}`} tabIndex={0}><EventPreviewDisplay event={event} tab={tab} /></div>}
    </section> : <p className="text-muted-foreground">No MVP modules enabled. Enable modules on the Overview tab.</p>}
    {(event.modules.boss || event.modules.login_rewards || event.modules.challenge_rules) && <p className="text-sm text-muted-foreground">Boss, login rewards, and challenge rules are outside this MVP preview.</p>}
    <ConfirmDialog state={confirm ? { action: "publish", event } : null} pending={publish.isPending} onCancel={() => { if (!publish.isPending) setConfirm(false); }} onConfirm={confirmPublish} />
  </div>;
}

export default function EventPreviewContent() {
  return <ModuleEditorLoader>{(event) => <Preview key={event._id} event={event} />}</ModuleEditorLoader>;
}
