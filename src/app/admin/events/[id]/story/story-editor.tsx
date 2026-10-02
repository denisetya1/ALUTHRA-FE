"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { newStoryStage, storyStagesPayload, toLocalDateTime } from "@/lib/event-preview";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { storyFormValues } from "@/lib/event-payload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCardOptions, useItemOptions } from "@/hooks/use-admin-options";
import { useSaveEventModule } from "@/hooks/use-events";
import { z } from "zod";
import { eventStageSchema, type EventStageValues } from "@/schemas/event";

const z_stages = z.object({ stages: z.array(eventStageSchema) });
import type { EventDefinition } from "@/types/events";
import { ArrayControls, FieldError, ModuleCard, ModuleSaveBar, RowLabel, AddRowButton } from "../components/module-editor-kit";
import { RewardSelector } from "../components/reward-selector";

export default function StoryEditor({ event }: { event: EventDefinition }) {
  const { id = "" } = useParams<{ id: string }>();
  const router = useRouter();
  const saveModule = useSaveEventModule();
  const items = useItemOptions();
  const cards = useCardOptions();
  const eventCurrencies = event.currencies ?? [];

  const form = useForm<{ stages: EventStageValues[] }>({
    resolver: zodResolver(z_stages),
    defaultValues: { stages: storyFormValues(event).stages.map((stage) => ({ ...stage, unlock: { ...stage.unlock, at: toLocalDateTime(stage.unlock.at) } })) },
  });
  const { register } = form;
  const currentStages = useWatch({ control: form.control, name: "stages" });
  const { fields, append, move, remove } = useFieldArray({ control: form.control, name: "stages" });
  const [dragged, setDragged] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  function reorder(from: number, to: number) {
    move(from, to);
    setAnnouncement(`Stage moved from position ${from + 1} to ${to + 1}.`);
  }
  const eventEnabled = event.modules.story;

  async function submit(values: { stages: EventStageValues[] }) {
    try {
      form.clearErrors("root");
      const referencedStages = [
        ...(event.missions ?? []).map((mission) => mission.condition.filters?.stage_number),
        ...(event.shop_items ?? []).filter((offer) => offer.unlock.type === "previous_stage").map((offer) => offer.unlock.stage_number),
      ].filter((number): number is number => number !== undefined);
      const payload = storyStagesPayload(values.stages, referencedStages);
      await saveModule.mutateAsync({ eventId: id, field: "stages", payload });
      form.reset({ stages: storyFormValues({ stages: payload }).stages.map((stage) => ({ ...stage, unlock: { ...stage.unlock, at: toLocalDateTime(stage.unlock.at) } })) });
      toast.success("Story stages saved.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save story stages.";
      form.setError("root", { message });
      toast.error(message);
    }
  }

  const pending = saveModule.isPending;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit, () => toast.error("Please correct the highlighted fields."))}>
        {eventEnabled === false && (
          <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            The Story module is disabled for this event. Enable it on the Overview tab to include story stages.
          </p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1>Story stages</h1>
            <p className="text-muted-foreground">Order is the play order; stage numbers are renumbered on save.</p>
          </div>
          <AddRowButton onClick={() => {
            const stage = newStoryStage(fields.length);
            stage.stage_number = Math.max(0, ...form.getValues("stages").map((entry) => entry.stage_number)) + 1;
            append(stage);
          }} label="Add stage" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Drag the stage handle to reorder, or use the move up and down buttons.</p>
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        {fields.length === 0 && <p className="py-6 text-muted-foreground">No story stages yet. Add the first stage to begin.</p>}
        <fieldset disabled={pending} className="min-w-0">
        <div className="mt-6 grid min-w-0 gap-5">
          {fields.map((field, index) => {
            const unlockType = currentStages[index]?.unlock.type;
            return (
              <div key={field.id} onDragOver={(e) => { if (dragged) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; } }} onDrop={(e) => {
                e.preventDefault();
                const from = fields.findIndex((entry) => entry.id === dragged);
                if (from >= 0 && from !== index) reorder(from, index);
                setDragged(null);
              }}>
              <ModuleCard
                title={`Stage ${index + 1}`}
                description=""
                action={<div className="flex items-center">
                  <Button type="button" variant="ghost" size="icon-sm" draggable aria-label={`Drag stage ${index + 1} to reorder`} onDragStart={(e) => { setDragged(field.id); e.dataTransfer.setData("text/plain", field.id); e.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => setDragged(null)}><GripVertical /></Button>
                  <ArrayControls array={{ fields, swap: reorder, remove }} index={index} label={`stage ${index + 1}`} />
                </div>}
              >
                <div className="grid grid-cols-2 gap-5 max-[800px]:grid-cols-1">
                  <div className="grid content-start gap-2">
                    <RowLabel>Name (EN) *</RowLabel>
                    <Input {...register(`stages.${index}.name_english` as const)} />
                    <FieldError errors={form.formState.errors} path={`stages.${index}.name_english`} />
                  </div>
                  <div className="grid content-start gap-2">
                    <RowLabel>Name (ID)</RowLabel>
                    <Input {...register(`stages.${index}.name_indonesia` as const)} />
                  </div>
                  <div className="grid content-start gap-2">
                    <RowLabel>Description (EN)</RowLabel>
                    <Textarea rows={2} {...register(`stages.${index}.description_english` as const)} />
                  </div>
                  <div className="grid content-start gap-2">
                    <RowLabel>Description (ID)</RowLabel>
                    <Textarea rows={2} {...register(`stages.${index}.description_indonesia` as const)} />
                  </div>
                  <div className="grid content-start gap-2 col-span-full">
                    <RowLabel>Story text / dialogue (EN)</RowLabel>
                    <Textarea rows={4} {...register(`stages.${index}.story_text_english` as const)} />
                  </div>
                  <div className="grid content-start gap-2 col-span-full">
                    <RowLabel>Story text / dialogue (ID)</RowLabel>
                    <Textarea rows={4} {...register(`stages.${index}.story_text_indonesia` as const)} />
                  </div>
                  <div className="grid content-start gap-2">
                    <RowLabel>Difficulty *</RowLabel>
                    <Select {...register(`stages.${index}.difficulty` as const)}>
                      <option value="normal">Normal</option>
                      <option value="hard">Hard</option>
                      <option value="very_hard">Very hard</option>
                    </Select>
                  </div>
                  <div className="grid content-start gap-2">
                    <RowLabel>Recommended power</RowLabel>
                    <Input type="number" min="0" {...register(`stages.${index}.recommended_power` as const, { valueAsNumber: true })} />
                  </div>
                  <div className="grid content-start gap-2">
                    <RowLabel>Energy cost</RowLabel>
                    <Input type="number" min="0" {...register(`stages.${index}.energy_cost` as const, { valueAsNumber: true })} />
                  </div>
                  <div className="grid content-start gap-2">
                    <RowLabel>Attempts per day (0 = unlimited)</RowLabel>
                    <Input type="number" min="0" {...register(`stages.${index}.attempts_per_day` as const, { valueAsNumber: true })} />
                  </div>
                  <div className="grid content-start gap-2">
                    <RowLabel>Enemy cards (comma separated card IDs)</RowLabel>
                    <Input {...register(`stages.${index}.enemy_ids` as const, { setValueAs: (v: string) => (Array.isArray(v) ? v : String(v).split(",").map((s) => s.trim()).filter(Boolean)) })} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id={`repeatable-${index}`} checked={currentStages[index]?.repeatable ?? false} onCheckedChange={(checked) => form.setValue(`stages.${index}.repeatable`, checked)} />
                    <Label htmlFor={`repeatable-${index}`}>Repeatable</Label>
                  </div>

                  <div className="col-span-full grid gap-3 rounded-lg border border-border p-4">
                    <RowLabel>Unlock condition</RowLabel>
                    <div className="grid items-end gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                      <Select {...register(`stages.${index}.unlock.type` as const)}>
                        <option value="previous_stage">Previous stage completed</option>
                        <option value="player_level">Player level reached</option>
                        <option value="event_points">Event points reached</option>
                        <option value="mission">Specific mission completed</option>
                        <option value="datetime">Date/time reached</option>
                        <option value="none">No condition</option>
                      </Select>
                      {unlockType === "player_level" ? (
                        <Input type="number" min="1" placeholder="Required level" aria-label="Required level" {...register(`stages.${index}.unlock.level` as const, { valueAsNumber: true })} />
                      ) : unlockType === "event_points" ? (
                        <Input type="number" min="1" placeholder="Required event points" aria-label="Required event points" {...register(`stages.${index}.unlock.points` as const, { valueAsNumber: true })} />
                      ) : unlockType === "mission" ? (
                        <Input placeholder="Mission code (e.g. win-5-battles)" aria-label="Required mission code" {...register(`stages.${index}.unlock.mission_code` as const)} />
                      ) : unlockType === "datetime" ? (
                        <Input type="datetime-local" step="0.001" aria-label="Unlock date (local timezone)" {...register(`stages.${index}.unlock.at` as const)} />
                      ) : null}
                    </div>
                    <FieldError errors={form.formState.errors} path={`stages.${index}.unlock`} />
                  </div>

                  <div className="col-span-full grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <RowLabel>First clear rewards</RowLabel>
                      <RewardSelector basePath={`stages.${index}.first_clear_rewards`} itemOptions={items.data?.data ?? []} cardOptions={cards.data?.data ?? []} eventCurrencies={eventCurrencies} />
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <RowLabel>Repeat rewards</RowLabel>
                      <RewardSelector basePath={`stages.${index}.repeat_rewards`} itemOptions={items.data?.data ?? []} cardOptions={cards.data?.data ?? []} eventCurrencies={eventCurrencies} />
                    </div>
                  </div>
                </div>
              </ModuleCard>
              </div>
            );
          })}
        </div>
        </fieldset>
        <ModuleSaveBar pending={pending} error={form.formState.errors.root?.message} />
      </form>
    </FormProvider>
  );
}

