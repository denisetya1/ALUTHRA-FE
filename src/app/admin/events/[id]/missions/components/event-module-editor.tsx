"use client";

import { useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCardOptions, useItemOptions } from "@/hooks/use-admin-options";
import { useSaveEventModule } from "@/hooks/use-events";
import { MISSION_CONDITION_TYPES } from "@/schemas/event";
import { emptyModuleRow, moduleFormValues, modulePayload, moduleSchema, optionalNumber, type ModuleField, type ModuleFormValues } from "@/lib/event-module-forms";
import type { EventDefinition } from "@/types/events";
import type { CardOption, ItemOption } from "@/types/admin-options";
import { AddRowButton, ArrayControls, FieldError, ModuleCard, ModuleSaveBar } from "../../components/module-editor-kit";
import { RewardSelector } from "../../components/reward-selector";
import { ModuleEditorLoader } from "../../components/module-editor-loader";

type Option = { value: string; label: string };
const titles: Record<ModuleField, string> = { missions: "Missions", currencies: "Event currencies", shop_items: "Exchange shop", milestones: "Point milestones" };
const modules = { missions: "missions", currencies: "currency", shop_items: "shop", milestones: "milestones" } as const;

function Field({ path, label, type = "text", optional = false, options, multiline = false, hint }: {
  path: Path<ModuleFormValues>; label: string; type?: string; optional?: boolean; options?: Option[]; multiline?: boolean; hint?: string;
}) {
  const { register, formState } = useFormContext<ModuleFormValues>();
  const id = `event-${path}`;
  const props = register(path, type === "number" ? optional ? { setValueAs: optionalNumber } : { valueAsNumber: true } : undefined);
  return <div className="grid content-start gap-2">
    <Label htmlFor={id}>{label}</Label>
    {options ? <Select id={id} {...props}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select> : multiline ? <Textarea id={id} rows={3} {...props} /> : <Input id={id} type={type} step={type === "datetime-local" ? "0.001" : type === "number" ? "1" : undefined} {...props} />}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    <FieldError errors={formState.errors} path={path} />
  </div>;
}

function Toggle({ path, label }: { path: Path<ModuleFormValues>; label: string }) {
  const { register } = useFormContext<ModuleFormValues>();
  return <Label className="flex items-center gap-3 py-2"><input type="checkbox" className="size-4 accent-primary" {...register(path)} />{label}</Label>;
}

function MissionFields({ index, items, cards, event }: { index: number; items: ItemOption[]; cards: CardOption[]; event: EventDefinition }) {
  const base = `missions.${index}` as const;
  return <>
    <Field path={`${base}.mission_code`} label="Mission code *" hint="Stable internal key; lowercase letters, numbers, dashes or underscores." />
    <Field path={`${base}.name_english`} label="Name (EN) *" />
    <Field path={`${base}.name_indonesia`} label="Name (ID)" />
    <Field path={`${base}.points`} label="Event points" type="number" optional hint="Blank means no point grant." />
    <Field path={`${base}.description_english`} label="Description (EN)" multiline />
    <Field path={`${base}.description_indonesia`} label="Description (ID)" multiline />
    <Field path={`${base}.condition.type`} label="Condition type *" options={MISSION_CONDITION_TYPES.map((value) => ({ value, label: value.replaceAll("_", " ") }))} />
    <Field path={`${base}.condition.target`} label="Target *" type="number" />
    <details className="col-span-full rounded-md border p-4">
      <summary className="cursor-pointer text-sm font-medium">Optional condition filters</summary>
      <p className="mt-2 text-xs text-muted-foreground">All filters are available for every condition. Leave blank to match any value.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field path={`${base}.condition.filters.realm`} label="Realm" options={[{ value: "", label: "Any realm" }, ...["solaris", "sylvara", "umbra"].map(value => ({ value, label: value }))]} />
        <Field path={`${base}.condition.filters.rarity`} label="Rarity" type="number" optional options={[{ value: "", label: "Any rarity" }, ...["Common", "Rare", "Epic", "Legendary", "Mythic"].map((label, value) => ({ value: String(value), label }))]} />
        <Field path={`${base}.condition.filters.character_id`} label="Character card" options={[{ value: "", label: "Any card" }, ...cards.map(card => ({ value: card._id, label: card.name || card._id }))]} />
        <Field path={`${base}.condition.filters.stage_number`} label="Stage number" type="number" optional />
        <Field path={`${base}.condition.filters.battle_type`} label="Battle type" hint="Optional engine battle-type key." />
        <Field path={`${base}.condition.filters.item_id`} label="Item" options={[{ value: "", label: "Any item" }, ...items.map(item => ({ value: item._id, label: item.name_english || item.name_indonesia || item._id }))]} />
        <Field path={`${base}.condition.filters.currency`} label="Currency filter" options={[{ value: "", label: "Any currency" }, { value: "crown", label: "Crown" }, { value: "aether", label: "Aether" }, ...(event.currencies ?? []).map(currency => ({ value: currency.currency_code, label: currency.name_english }))]} />
      </div>
    </details>
    <Toggle path={`${base}.repeatable`} label="Repeatable" />
    <Field path={`${base}.reset_type`} label="Reset schedule" options={[{ value: "none", label: "Never" }, { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }]} />
    <Field path={`${base}.starts_at`} label="Starts at (UTC)" type="datetime-local" hint="Optional; blank uses the event schedule." />
    <Field path={`${base}.ends_at`} label="Ends at (UTC)" type="datetime-local" />
  </>;
}

function CurrencyFields({ index }: { index: number }) {
  const base = `currencies.${index}` as const;
  return <>
    <Field path={`${base}.currency_code`} label="Currency code *" hint="Stable key used by rewards and exchange prices. Renaming does not update references." />
    <Field path={`${base}.name_english`} label="Name (EN) *" />
    <Field path={`${base}.name_indonesia`} label="Name (ID)" />
    <Field path={`${base}.icon_image`} label="Icon image URL" />
    <Field path={`${base}.max_carry`} label="Maximum carry" type="number" optional hint="Blank leaves the carry cap unset; 0 is preserved." />
    <Field path={`${base}.grace_period_days`} label="Grace period (days)" type="number" optional hint="Days available after the event ends; 0 means no grace period." />
  </>;
}

function ShopFields({ index, event }: { index: number; event: EventDefinition }) {
  const base = `shop_items.${index}` as const;
  const { watch } = useFormContext<ModuleFormValues>();
  const unlock = watch(`${base}.unlock.type`);
  return <>
    <Field path={`${base}.currency_code`} label="Price currency *" options={[{ value: "", label: "Select event currency" }, ...(event.currencies ?? []).map(currency => ({ value: currency.currency_code, label: `${currency.name_english} (${currency.currency_code})` }))]} />
    <Field path={`${base}.price`} label="Price *" type="number" />
    <Field path={`${base}.purchase_limit`} label="Total purchase limit" type="number" optional hint="Blank or 0 means unlimited." />
    <Field path={`${base}.daily_limit`} label="Daily purchase limit" type="number" optional hint="Blank or 0 means unlimited." />
    <Field path={`${base}.available_from`} label="Available from (UTC)" type="datetime-local" hint="Optional; blank uses the event schedule." />
    <Field path={`${base}.available_until`} label="Available until (UTC)" type="datetime-local" />
    <Field path={`${base}.unlock.type`} label="Unlock condition" options={[{ value: "none", label: "No condition" }, { value: "previous_stage", label: "Stage completed" }, { value: "player_level", label: "Player level" }, { value: "event_points", label: "Event points" }, { value: "mission", label: "Mission completed" }, { value: "datetime", label: "Date and time" }]} />
    {unlock === "player_level" && <Field path={`${base}.unlock.level`} label="Required player level *" type="number" optional />}
    {unlock === "event_points" && <Field path={`${base}.unlock.points`} label="Required event points *" type="number" optional />}
    {unlock === "previous_stage" && <Field path={`${base}.unlock.stage_number`} label="Required stage number *" type="number" optional />}
    {unlock === "mission" && <Field path={`${base}.unlock.mission_code`} label="Required mission *" options={[{ value: "", label: "Select mission" }, ...(event.missions ?? []).map(mission => ({ value: mission.mission_code, label: `${mission.name_english} (${mission.mission_code})` }))]} />}
    {unlock === "datetime" && <Field path={`${base}.unlock.at`} label="Unlock at (UTC) *" type="datetime-local" />}
  </>;
}

export function EventModuleEditor({ event, field }: { event: EventDefinition; field: ModuleField }) {
  const save = useSaveEventModule();
  const items = useItemOptions();
  const cards = useCardOptions();
  const [dragging, setDragging] = useState<string | null>(null);
  const form = useForm<ModuleFormValues>({ resolver: zodResolver(moduleSchema(field, event.currencies ?? [])), defaultValues: moduleFormValues(event) });
  const array = useFieldArray({ control: form.control, name: field });
  const title = titles[field];
  async function submit(values: ModuleFormValues) {
    form.clearErrors("root");
    try {
      await save.mutateAsync({ eventId: event._id, field, payload: modulePayload(field, values[field]) });
      form.reset(values);
      toast.success(`${title} saved.`);
    } catch (error) {
      form.setError("root", { message: error instanceof Error ? error.message : "Unable to save this module." });
    }
  }
  return <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(submit, () => toast.error("Correct the highlighted fields before saving."))} noValidate>
      <fieldset disabled={save.isPending} className="min-w-0">
        {!event.modules[modules[field]] && <p role="status" className="mb-4 rounded-md border p-3 text-sm text-muted-foreground">This module is disabled. You can edit its configuration here; enable it on Overview to include it in the event.</p>}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{field === "shop_items" ? "Drag the handle or use the arrow buttons to set display order." : "Add rows and use the arrow buttons to set their order."} Changes are saved together.</p></div>
          <AddRowButton label={`Add ${field === "currencies" ? "currency" : field === "shop_items" ? "shop listing" : field === "milestones" ? "milestone" : "mission"}`} onClick={() => array.append(emptyModuleRow(field))} />
        </header>
        {field !== "currencies" && (items.isError || cards.isError) && <p role="alert" className="mt-4 text-sm text-destructive">Some item or card options could not load. <Button type="button" variant="link" onClick={() => { void items.refetch(); void cards.refetch(); }}>Retry options</Button></p>}
        {field === "shop_items" && !event.currencies?.length && <p className="mt-4 text-sm text-muted-foreground">Add an event currency on the Currency tab before configuring prices.</p>}
        <div className="mt-6 grid gap-5">
          {!array.fields.length && <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No {title.toLowerCase()} yet. Add the first row to configure this module.</div>}
          {array.fields.map((row, index) => <div key={row.id} className={dragging === row.id ? "opacity-60" : undefined}
            onDragOver={field === "shop_items" ? (event) => { if (dragging) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; } } : undefined}
            onDrop={field === "shop_items" ? (event) => { event.preventDefault(); const from = array.fields.findIndex(entry => entry.id === event.dataTransfer.getData("text/plain")); if (from >= 0 && from !== index) array.move(from, index); setDragging(null); } : undefined}>
            <ModuleCard title={`${field === "currencies" ? "Currency" : field === "shop_items" ? "Listing" : field === "milestones" ? "Milestone" : "Mission"} ${index + 1}`} description=""
              action={<div className="flex items-center gap-1">{field === "shop_items" && <Button type="button" variant="ghost" size="icon-sm" aria-label={`Drag listing ${index + 1} to reorder`} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", row.id); event.dataTransfer.effectAllowed = "move"; setDragging(row.id); }} onDragEnd={() => setDragging(null)}><GripVertical /></Button>}<ArrayControls array={array} index={index} label={`${title.toLowerCase()} row ${index + 1}`} /></div>}>
              <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                {field === "missions" && <MissionFields index={index} event={event} items={items.data?.data ?? []} cards={cards.data?.data ?? []} />}
                {field === "currencies" && <CurrencyFields index={index} />}
                {field === "shop_items" && <ShopFields index={index} event={event} />}
                {field === "milestones" && <><Field path={`milestones.${index}.required_points`} label="Required points *" type="number" /><Toggle path={`milestones.${index}.claimable`} label="Claimable" /></>}
                {field !== "currencies" && <div className="col-span-full rounded-lg border p-4"><RewardSelector basePath={`${field}.${index}.rewards`} itemOptions={items.data?.data ?? []} cardOptions={cards.data?.data ?? []} eventCurrencies={event.currencies ?? []} /></div>}
              </div>
            </ModuleCard>
          </div>)}
        </div>
        <ModuleSaveBar pending={save.isPending} error={form.formState.errors.root?.message} />
      </fieldset>
    </form>
  </FormProvider>;
}

export default function EventModuleContent({ field }: { field: ModuleField }) {
  return <ModuleEditorLoader>{event => <EventModuleEditor key={`${event._id}-${field}`} event={event} field={field} />}</ModuleEditorLoader>;
}
