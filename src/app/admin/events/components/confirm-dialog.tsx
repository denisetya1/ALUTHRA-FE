"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { EventListItem } from "@/types/events";

export type ConfirmAction = "publish" | "disable" | "archive" | "duplicate";

const COPY: Record<ConfirmAction, { title: string; description: string; confirm: string; destructive: boolean }> = {
  publish: {
    title: "Publish event",
    description:
      "The event will be validated and go active immediately, or be scheduled if the start date is in the future. Publishing is blocked while critical validation errors remain.",
    confirm: "Publish",
    destructive: false,
  },
  disable: {
    title: "Disable event",
    description:
      "The event will be hidden from players immediately. Any in-progress event content becomes unavailable until the event is published again.",
    confirm: "Disable event",
    destructive: true,
  },
  archive: {
    title: "Archive event",
    description:
      "The event will be marked ended and locked from editing. This cannot be undone from the dashboard.",
    confirm: "Archive",
    destructive: true,
  },
  duplicate: {
    title: "Duplicate event",
    description:
      "A new draft event will be created with the same modules, rewards, and assets. The schedule is reset and all analytics and player progress start empty.",
    confirm: "Duplicate",
    destructive: false,
  },
};

export function ConfirmDialog({
  state,
  pending,
  onCancel,
  onConfirm,
}: {
  state: { action: ConfirmAction; event: EventListItem } | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: (action: ConfirmAction, event: EventListItem) => void;
}) {
  if (!state) return null;
  const copy = COPY[state.action];
  return (
    <AlertDialog open onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {copy.title} — {state.event.name_english}
          </AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={pending}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button
            variant={copy.destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={() => onConfirm(state.action, state.event)}
          >
            {copy.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
