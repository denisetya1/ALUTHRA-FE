"use client";

import { Select } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { relicSchema, type RelicValues } from "@/schemas/relic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import type { EffectOption } from "@/types/admin-options";
import { useSaveRelic } from "@/hooks/use-relics";
import { useUpload } from "@/hooks/use-upload";
import { FormError } from "@/components/admin/page-state";
export type RelicDefaults = Omit<RelicValues, "image_file"> & {
  image?: string;
};
export default function RelicForm({
  mode = "create",
  relicId,
  initialValues,
  effects,
}: {
  mode?: "create" | "edit";
  relicId?: string;
  initialValues?: RelicDefaults;
  effects: EffectOption[];
}) {
  const router = useRouter();
  const saveRelic = useSaveRelic();
  const uploadImage = useUpload();
  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RelicValues>({
    resolver: zodResolver(relicSchema),
    mode: "onBlur",
    defaultValues: initialValues ?? {
      name_english: "",
      name_indonesia: "",
      desc_english: "",
      desc_indonesia: "",
      effect: "",
      effect_amount: 0,
      price: 0,
      discount: 0,
      shop: false,
    },
  });
  const err = (n: keyof RelicValues) =>
    errors[n] && <small className="text-sm text-destructive">{errors[n]?.message}</small>;
  const fail = (message: string) => {
    setError("root", { message });
    toast.error(message);
  };
  async function submit(values: RelicValues) {
    clearErrors("root");
    const { image_file, ...body } = values;
    try {
      let image = initialValues?.image ?? "";
      const file = image_file?.[0];
      if (file) {
        image = (await uploadImage.mutateAsync({ file, kind: "relics" })).url;
      }
      await saveRelic.mutateAsync({ id: mode === "edit" ? relicId : undefined, payload: { ...body, image } });
      toast.success(mode === "edit" ? "Relic updated successfully." : "Relic created successfully.");
      router.push(`/admin/relics?${mode === "edit" ? "updated" : "created"}=1`);
      router.refresh();
    } catch (error) {
      fail(error instanceof Error ? error.message : "Unable to save relic.");
    }
  }
  return (
    <section className="mx-auto max-w-[960px]">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/relics">
          <ArrowLeft />
          Back to relics
        </Link>
      </Button>
      <div className="my-6 mb-7">
        <h1>{mode === "edit" ? "Edit relic" : "Add relic"}</h1>
        <p className="text-muted-foreground">
          {mode === "edit"
            ? "Update this relic and its gameplay effect."
            : "Create a relic and configure its gameplay effect."}
        </p>
      </div>
      <form className="mt-6" noValidate onSubmit={handleSubmit(submit, () => toast.error("Please correct the highlighted relic fields."))}>
        <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-6 border-0 p-0 disabled:opacity-65">
          <Card>
            <CardHeader>
              <CardTitle>Relic details</CardTitle>
              <CardDescription>
                Names, artwork, and descriptions for each language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
                {(["name_english", "name_indonesia"] as const).map((n) => (
                  <div className="grid min-w-0 content-start gap-2" key={n}>
                    <Label htmlFor={n}>
                      Name ({n.endsWith("english") ? "English" : "Indonesia"})
                      {n.endsWith("english") ? " *" : ""}
                    </Label>
                    <Input id={n} {...register(n)} />
                    {err(n)}
                  </div>
                ))}
                <div className="grid min-w-0 content-start gap-2 col-span-full">
                  <Label htmlFor="image_file">Relic image</Label>
                  <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border bg-[var(--page)] p-[22px]">
                    <div className="rounded-lg border border-border bg-background p-3 text-muted-foreground">
                      <ImagePlus size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p>Choose a relic image</p>
                      <span>
                        PNG, JPG, or WebP · Up to 5 MB
                        {initialValues?.image
                          ? " · Leave empty to keep current image"
                          : ""}
                      </span>
                    </div>
                    <Input
                      id="image_file"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      {...register("image_file")}
                    />
                  </div>
                  {err("image_file")}
                </div>
                {(["desc_english", "desc_indonesia"] as const).map((n) => (
                  <div className="grid min-w-0 content-start gap-2" key={n}>
                    <Label htmlFor={n}>
                      Description (
                      {n.endsWith("english") ? "English" : "Indonesia"})
                    </Label>
                    <Textarea id={n} rows={4} {...register(n)} />
                    {err(n)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Effect & pricing</CardTitle>
              <CardDescription>
                Configure the relic effect and shop values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="effect">Effect *</Label>
                  <Select id="effect" {...register("effect")}>
                    <option value="">Select item effect</option>
                    {effects.map((effect) => (
                      <option key={effect._id} value={effect.name}>
                        {effect.description} ({effect.name})
                      </option>
                    ))}
                  </Select>
                  {err("effect")}
                </div>
                {(["effect_amount", "price", "discount"] as const).map((n) => (
                  <div className="grid min-w-0 content-start gap-2" key={n}>
                    <Label htmlFor={n}>{n.replace("_", " ")} *</Label>
                    <Input
                      id={n}
                      type="number"
                      min="0"
                      step="1"
                      {...register(n, { valueAsNumber: true })}
                    />
                    {err(n)}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-start gap-3 border-t border-border pt-6">
                <Controller
                  control={control}
                  name="shop"
                  render={({ field }) => (
                    <Checkbox
                      id="shop"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  )}
                />
                <div>
                  <Label htmlFor="shop">Available in shop</Label>
                  <p>Allow players to purchase this relic.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </fieldset>
        <FormError message={errors.root?.message}/>
        <div className="flex justify-end gap-3 py-6">
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/admin/relics">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            className="min-w-[136px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            {isSubmitting
              ? "Saving…"
              : mode === "edit"
                ? "Update relic"
                : "Save relic"}
          </Button>
        </div>
      </form>
    </section>
  );
}
