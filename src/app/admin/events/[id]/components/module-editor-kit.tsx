"use client";

import { Plus, Trash2, ArrowUp, ArrowDown, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/admin/page-state";
import type { FieldErrors } from "react-hook-form";

/** Shared bits for module editors: sortable field-array rows and reward editor rows. */
export function ModuleSaveBar({ pending, error }: { pending: boolean; error?: string }) {
  return (
    <>
      <FormError message={error} />
      <div className="flex justify-end gap-3 py-6">
        <Button type="submit" size="lg" className="min-w-[136px]" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          {pending ? "Saving…" : "Save module"}
        </Button>
      </div>
    </>
  );
}

export function ArrayControls({
  array,
  index,
  label,
}: {
  array: { fields: unknown[]; swap: (a: number, b: number) => void; remove: (index: number) => void };
  index: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Move ${label} up`}
        disabled={index === 0}
        onClick={() => array.swap(index, index - 1)}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Move ${label} down`}
        disabled={index === array.fields.length - 1}
        onClick={() => array.swap(index, index + 1)}
      >
        <ArrowDown />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${label}`} onClick={() => array.remove(index)}>
        <Trash2 />
      </Button>
    </div>
  );
}

export function AddRowButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Plus />
      {label}
    </Button>
  );
}

export function FieldError({ errors, path }: { errors: FieldErrors; path: string }) {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) current = (current as Record<string, unknown>)[part];
    else return null;
  }
  const message = (current as { message?: string } | undefined)?.message;
  if (!message) return null;
  return <small className="text-sm text-destructive">{String(message)}</small>;
}

export function ModuleCard({ title, description, children, action }: { title: string; description: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          {title}
          {action}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function RowLabel({ children }: { children: React.ReactNode }) {
  return <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</Label>;
}
