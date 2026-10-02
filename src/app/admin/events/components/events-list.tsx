"use client";

import { Select } from "@/components/ui/select";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  Archive,
  Ban,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArchiveEvent, useDisableEvent, useDuplicateEvent, useEvents, usePublishEvent } from "@/hooks/use-events";
import { useRealms } from "@/hooks/use-master-data";
import { PageLoading, PageError } from "@/components/admin/page-state";
import { MODULE_LABELS, EVENT_MODULE_KEYS } from "@/schemas/event";
import type { EventListItem } from "@/types/events";
import { ConfirmDialog } from "./confirm-dialog";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-[var(--primary-soft)] text-[var(--primary-soft-foreground)]",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  ended: "bg-muted text-muted-foreground",
  disabled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const dateLabel = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

type ConfirmState = { action: "publish" | "disable" | "archive" | "duplicate"; event: EventListItem } | null;

export function EventsList() {
  const params = useSearchParams();
  const router = useRouter();
  const search = (params.get("search") || "").slice(0, 100);
  const status = (params.get("status") || "").slice(0, 20);
  const realm = (params.get("realm") || "").slice(0, 50);
  const moduleFilter = (params.get("module") || "").slice(0, 30);
  const from = (params.get("from") || "").slice(0, 40);
  const to = (params.get("to") || "").slice(0, 40);
  const page = Math.floor(Math.max(1, Math.min(100000, Number(params.get("page")) || 1)));

  const query = new URLSearchParams({
    page: String(page),
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(realm ? { realm } : {}),
    ...(moduleFilter ? { module: moduleFilter } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  });
  const eventsQuery = useEvents(query.toString());
  const realmsQuery = useRealms();
  const publishEvent = usePublishEvent();
  const disableEvent = useDisableEvent();
  const archiveEvent = useArchiveEvent();
  const duplicateEvent = useDuplicateEvent();
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const result = eventsQuery.data;
  const realms = realmsQuery.data?.data ?? [];

  const runAction = (action: NonNullable<ConfirmState>["action"], event: EventListItem) => {
    const mutation =
      action === "publish" ? publishEvent : action === "disable" ? disableEvent : action === "archive" ? archiveEvent : duplicateEvent;
    mutation.mutate(
      { id: event._id },
      {
        onSuccess: (data) => {
          toast.success(
            action === "publish"
              ? `"${event.name_english}" is now ${data.status}.`
              : action === "duplicate"
                ? `Duplicated as "${(data as EventListItem).code}".`
                : `Event ${action === "disable" ? "disabled" : "archived"}.`,
          );
          router.refresh();
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Action failed."),
      },
    );
  };

  const pageLink = (next: number) => {
    const nextQuery = new URLSearchParams(query);
    nextQuery.set("page", String(next));
    return `/admin/events?${nextQuery}`;
  };

  return (
    <section>
      <p className="text-xs font-semibold text-muted-foreground">World</p>
      <div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start">
        <div>
          <h1>Events</h1>
          <p className="text-muted-foreground">Create, schedule, and monitor live game events.</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus />Add event
          </Link>
        </Button>
      </div>
      <form className="my-6 flex flex-wrap items-center gap-3">
        <Input name="search" aria-label="Search events" placeholder="Search name or code…" defaultValue={search} />
        <Select name="status" aria-label="Filter by status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="disabled">Disabled</option>
        </Select>
        <Select name="realm" aria-label="Filter by realm" defaultValue={realm}>
          <option value="">All realms</option>
          {realms.map((option) => (
            <option key={option._id} value={option.code}>
              {option.name}
            </option>
          ))}
        </Select>
        <Select name="module" aria-label="Filter by module" defaultValue={moduleFilter}>
          <option value="">All modules</option>
          {EVENT_MODULE_KEYS.map((key) => (
            <option key={key} value={key}>
              {MODULE_LABELS[key]}
            </option>
          ))}
        </Select>
        <Input name="from" type="date" aria-label="From date" defaultValue={from} className="w-auto" />
        <Input name="to" type="date" aria-label="To date" defaultValue={to} className="w-auto" />
        <Button type="submit" variant="outline">
          <Search />
          Search
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/admin/events">
            <X />
            Reset
          </Link>
        </Button>
      </form>
      {eventsQuery.isPending ? (
        <PageLoading label="Loading events…" />
      ) : eventsQuery.isError || !result ? (
        <PageError message="Unable to load events. Check the backend connection and refresh." />
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-background">
          <Table>
            <TableCaption className="p-[18px] text-left font-semibold">{result.total} events</TableCaption>
            <TableHeader>
              <TableRow>
                {["Event", "Modules", "Status", "Start", "End", "Featured", "Last updated", "Actions"].map((name) => (
                  <TableHead key={name}>{name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.length ? (
                result.data.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell className="min-w-[240px]">
                      <strong>
                        {event.name_english}
                        {event.featured ? <span className="ml-2 text-amber-500">★</span> : null}
                      </strong>
                      <small className="block">{event.code}</small>
                      {event.realm_restriction?.length ? <small>Realms: {event.realm_restriction.join(", ")}</small> : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {EVENT_MODULE_KEYS.filter((key) => event.modules?.[key]).map((key) => (
                          <span key={key} className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                            {MODULE_LABELS[key]}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[event.status] || ""}`}>
                        {event.status}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{dateLabel(event.start_at)}</TableCell>
                    <TableCell className="whitespace-nowrap">{dateLabel(event.end_at)}</TableCell>
                    <TableCell>{event.featured ? "Yes" : "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{event.updatedAt ? dateLabel(event.updatedAt) : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2 whitespace-nowrap">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/events/${event._id}/edit`}>
                            <Pencil />
                            Edit
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/events/${event._id}/preview`}>Preview</Link>
                        </Button>
                        {event.status !== "active" && event.status !== "ended" && (
                          <Button size="sm" variant="outline" onClick={() => setConfirm({ action: "publish", event })}>
                            <Play />
                            Publish
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setConfirm({ action: "duplicate", event })}>
                          <Copy />
                          Duplicate
                        </Button>
                        {event.status !== "disabled" && event.status !== "ended" && (
                          <Button size="sm" variant="outline" onClick={() => setConfirm({ action: "disable", event })}>
                            <Ban />
                            Disable
                          </Button>
                        )}
                        {event.status === "ended" || event.status === "disabled" ? (
                          <Button size="sm" variant="outline" onClick={() => setConfirm({ action: "archive", event })}>
                            <Archive />
                            Archive
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="p-8 text-center text-muted-foreground">
                    {search || status || realm || moduleFilter || from || to
                      ? "No events match these filters."
                      : "No events yet. Use Add event to create the first event."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <footer className="flex justify-between gap-4 p-[18px] text-xs text-muted-foreground">
            <span>
              Page {page} · {result.total} results
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={pageLink(page - 1)}>
                    <ChevronLeft />
                    Previous
                  </Link>
                </Button>
              )}
              {page * 20 < result.total && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={pageLink(page + 1)}>
                    Next
                    <ChevronRight />
                  </Link>
                </Button>
              )}
            </div>
          </footer>
        </div>
      )}
      <ConfirmDialog
        state={confirm}
        pending={publishEvent.isPending || disableEvent.isPending || archiveEvent.isPending || duplicateEvent.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={(action, event) => {
          setConfirm(null);
          runAction(action, event);
        }}
      />
    </section>
  );
}

function Input(props: React.ComponentProps<"input">) {
  return (
    <input
      className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-[var(--primary-soft)]"
      {...props}
    />
  );
}
