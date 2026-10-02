"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/admin/page-state";
import { useRealms } from "@/hooks/use-master-data";
import { useUpload } from "@/hooks/use-upload";
import { useSaveEvent } from "@/hooks/use-events";
import { overviewSavePayload } from "@/lib/event-editor-fields";
import { eventBaseSchema, EVENT_MODULE_KEYS, MODULE_LABELS, type EventBaseValues } from "@/schemas/event";

export type EventOverviewDefaults = Omit<EventBaseValues, "banner_file"> & {
  banner_image: string;
  background_image: string;
  icon_image: string;
};

export default function EventOverviewForm({
  eventId,
  status,
  initialValues,
}: {
  eventId?: string;
  status?: string;
  initialValues?: EventOverviewDefaults;
}) {
  const router = useRouter();
  const saveEvent = useSaveEvent();
  const uploadImage = useUpload();
  const realms = useRealms();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventBaseValues>({
    resolver: zodResolver(eventBaseSchema),
    defaultValues: initialValues ?? {
      code: "",
      name_english: "",
      name_indonesia: "",
      description_short_english: "",
      description_short_indonesia: "",
      description_english: "",
      description_indonesia: "",
      start_at: "",
      end_at: "",
      visibility_start_at: "",
      visibility_end_at: "",
      realm_restriction: [],
      banner_image: "",
      background_image: "",
      icon_image: "",
      priority: 0,
      featured: false,
      tags: [],
      modules: { story: false, missions: false, boss: false, currency: false, shop: false, login_rewards: false, milestones: false, challenge_rules: false },
    },
  });

  const modules = watch("modules");
  const featured = watch("featured");
  const realmRestriction = watch("realm_restriction");

  async function submit(values: EventBaseValues) {
    try {
      const saved = await saveEvent.mutateAsync({
        id: eventId,
        payload: {
          ...overviewSavePayload(values),
          status: status ?? "draft",
        },
      });
      toast.success(eventId ? "Event updated." : "Event created as draft.");
      if (!eventId) router.push(`/admin/events/${saved._id}/edit`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save event.";
      setError("root", { message });
      toast.error(message);
    }
  }

  async function uploadAsset(kind: "banner_image" | "background_image" | "icon_image", file: File) {
    try {
      const result = await uploadImage.mutateAsync({ file, kind: "events", name: kind });
      setValue(kind, result.url, { shouldDirty: true });
      toast.success("Image uploaded. Remember to save.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  const pending = isSubmitting || saveEvent.isPending || uploadImage.isPending;
  const text = (name: keyof EventBaseValues, label: string, type = "text") => (
    <div className="grid min-w-0 content-start gap-2">
      <Label htmlFor={String(name)}>{label}</Label>
      <Input id={String(name)} type={type} {...register(name, type === "number" ? { valueAsNumber: true } : {})} />
      {errors[name] && <small className="text-sm text-destructive">{String(errors[name]?.message)}</small>}
    </div>
  );
  const area = (name: keyof EventBaseValues, label: string, rows = 3) => (
    <div className="grid min-w-0 content-start gap-2">
      <Label htmlFor={String(name)}>{label}</Label>
      <Textarea id={String(name)} rows={rows} {...register(name)} />
      {errors[name] && <small className="text-sm text-destructive">{String(errors[name]?.message)}</small>}
    </div>
  );

  return (
    <form className="mt-6" noValidate onSubmit={handleSubmit(submit, () => toast.error("Please correct the highlighted fields."))}>
      <fieldset disabled={pending} className="m-0 grid min-w-0 gap-6 border-0 p-0 disabled:opacity-65">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Identity and display copy. Content is stored in English and Indonesian.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
              {text("code", "Internal code *")}
              {text("name_english", "Event name (EN) *")}
              {text("name_indonesia", "Event name (ID)")}
              {area("description_short_english", "Short description (EN)")}
              {area("description_short_indonesia", "Short description (ID)")}
              {area("description_english", "Full description (EN)", 5)}
              {area("description_indonesia", "Full description (ID)", 5)}
              <div className="col-span-full grid gap-4 max-[800px]:grid-cols-1 md:grid-cols-[repeat(3,minmax(0,1fr))]">
                {text("priority", "Priority / display order *", "number")}
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="min_player_level">Minimum player level</Label>
                  <Input id="min_player_level" type="number" min="1" {...register("min_player_level", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} />
                </div>
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="tags_text">Tags (comma separated)</Label>
                  <Input id="tags_text" {...register("tags", { setValueAs: (v) => (Array.isArray(v) ? v : String(v).split(",").map((t: string) => t.trim()).filter(Boolean)) })} />
                </div>
              </div>
              <div className="col-span-full flex items-center gap-3">
                <Switch id="featured" checked={featured} onCheckedChange={(checked) => setValue("featured", checked, { shouldDirty: true })} />
                <Label htmlFor="featured">Featured event</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Timestamps are stored in UTC and shown in your local timezone.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
              {text("start_at", "Start date & time *", "datetime-local")}
              {text("end_at", "End date & time *", "datetime-local")}
              {text("visibility_start_at", "Visibility start", "datetime-local")}
              {text("visibility_end_at", "Visibility end", "datetime-local")}
              {errors.end_at && <small className="col-span-full text-sm text-destructive">{String(errors.end_at.message)}</small>}
              {errors.visibility_end_at && <small className="col-span-full text-sm text-destructive">{String(errors.visibility_end_at.message)}</small>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>Enable the content modules this event combines. Each enabled module gets its own editor tab.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {EVENT_MODULE_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Switch id={`module-${key}`} disabled={key === "boss" || key === "login_rewards" || key === "challenge_rules"} checked={modules[key]} onCheckedChange={(checked) => setValue(`modules.${key}`, checked, { shouldDirty: true })} />
                  <Label htmlFor={`module-${key}`}>{MODULE_LABELS[key]}</Label>
                  {(key === "boss" || key === "login_rewards" || key === "challenge_rules") && (
                    <small className="ml-auto text-muted-foreground">Editor coming later</small>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>Banner, background, and icon images (PNG, JPG, WebP up to 5 MB).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {([
                ["banner_image", "Banner image"],
                ["background_image", "Background image"],
                ["icon_image", "Event icon"],
              ] as const).map(([field, label]) => {
                const currentUrl = watch(field);
                return (
                <div className="grid min-w-0 content-start gap-2" key={field}>
                  <Label htmlFor={field}>{label}</Label>
                  {currentUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentUrl} alt="" className="h-24 w-full rounded-lg border border-border object-cover" />
                  ) : null}
                  <Input
                    id={field}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(changeEvent) => {
                      const file = changeEvent.target.files?.[0];
                      if (file) void uploadAsset(field, file);
                    }}
                  />
                  <Input placeholder="…or paste an image URL" {...register(field)} />
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Targeting</CardTitle>
            <CardDescription>Restrict which realms can see and enter the event.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {(realms.data?.data ?? []).map((realm) => (
                <label key={realm._id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={realmRestriction.includes(realm.code)}
                    onCheckedChange={(checked) => {
                      const next = checked ? [...realmRestriction, realm.code] : realmRestriction.filter((code) => code !== realm.code);
                      setValue("realm_restriction", next, { shouldDirty: true });
                    }}
                  />
                  {realm.name}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </fieldset>
      <FormError message={errors.root?.message} />
      <div className="flex justify-end gap-3 py-6">
        <Button type="submit" size="lg" className="min-w-[136px]" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          {pending ? "Saving…" : eventId ? "Save changes" : "Create draft event"}
        </Button>
      </div>
    </form>
  );
}
