"use client";

import { Select } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemFormSchema, type ItemFormValues } from "@/schemas/item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, ImagePlus } from "lucide-react";
import { toast } from "react-toastify";
import type { EffectOption } from "@/types/admin-options";
import { useSaveItem } from "@/hooks/use-items";
import { useUpload } from "@/hooks/use-upload";
import { FormError } from "@/components/admin/page-state";

export type ItemDefaults = Omit<ItemFormValues, "image_file"> & {
  image?: string;
};
export default function ItemForm({
  mode = "create",
  itemId,
  initialValues,
  effects,
}: {
  mode?: "create" | "edit";
  itemId?: string;
  initialValues?: ItemDefaults;
  effects: EffectOption[];
}) {
  const router = useRouter();
  const saveItem = useSaveItem();
  const uploadImage = useUpload();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting: pending },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    mode: "onBlur",
    defaultValues: initialValues ?? {
      name_english: "",
      name_indonesia: "",
      desc_english: "",
      desc_indonesia: "",
      effect: "",
      effect_amount: 0,
    },
  });
  const fieldError = (name: keyof ItemFormValues) =>
    errors[name] && (
      <small id={name + "-error"} className="text-sm text-destructive" role="alert">
        {errors[name]?.message}
      </small>
    );
  const accessibility = (name: keyof ItemFormValues) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? name + "-error" : undefined,
  });
  const fail = (message: string) => {
    setError("root", { message });
    toast.error(message);
  };
  async function submit(values: ItemFormValues) {
    clearErrors("root");
    const { image_file, ...body } = values;
    const file = image_file?.[0];
    try {
      let image = initialValues?.image ?? "";
      if (file instanceof File && file.size) {
        image = (await uploadImage.mutateAsync({ file, kind: "items" })).url;
      }
      await saveItem.mutateAsync({ ...body, image, id: mode === "edit" ? itemId : undefined });
      toast.success(mode === "edit" ? "Item updated successfully." : "Item created successfully.");
      router.push(`/admin/items?${mode === "edit" ? "updated" : "created"}=1`);
      router.refresh();
    } catch (error) {
      fail(error instanceof Error ? error.message : "Unable to save. Check your connection and the Items list before retrying.");
    }
  }
  const isPending = pending || saveItem.isPending || uploadImage.isPending;
  return (
    <section className="mx-auto max-w-[960px]">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/items">
          <ArrowLeft />
          Back to items
        </Link>
      </Button>
      <div className="my-6 mb-7">
        <h1>{mode === "edit" ? "Edit item" : "Add item"}</h1>
        <p className="text-muted-foreground">
          {mode === "edit"
            ? "Update this item and its gameplay effect."
            : "Create an item for your world. Shop pricing is configured separately in the Shop menu."}
        </p>
      </div>
      <form className="mt-6" noValidate onSubmit={handleSubmit(submit, () => toast.error("Please correct the highlighted item fields."))}>
        <fieldset disabled={isPending} className="m-0 grid min-w-0 gap-6 border-0 p-0 disabled:opacity-65">
          <Card>
            <CardHeader>
              <CardTitle>Item details</CardTitle>
              <CardDescription>
                Name, artwork, and descriptions for each language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
                {(["name_english", "name_indonesia"] as const).map((name) => (
                  <div key={name} className="grid min-w-0 content-start gap-2">
                    <Label htmlFor={name}>
                      {name === "name_english"
                        ? "Name (English) *"
                        : "Name (Indonesia)"}
                    </Label>
                    <Input
                      id={name}
                      {...register(name)}
                      {...accessibility(name)}
                      placeholder={
                        name === "name_english"
                          ? "e.g. Stamina potion"
                          : "e.g. Ramuan stamina"
                      }
                    />
                    {fieldError(name)}
                  </div>
                ))}
                <div className="grid min-w-0 content-start gap-2 col-span-full">
                  <Label htmlFor="image_file">Item image</Label>
                  <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border bg-[var(--page)] p-[22px]">
                    <div className="rounded-lg border border-border bg-background p-3 text-muted-foreground">
                      <ImagePlus size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p>Choose an image for this item</p>
                      <span>
                        PNG, JPG, or WebP · Up to 5 MB
                        {initialValues?.image
                          ? " · Leave empty to keep current image"
                          : ""}
                      </span>
                    </div>
                    <Input
                      id="image_file"
                      {...register("image_file")}
                      {...accessibility("image_file")}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                    />
                  </div>
                  {fieldError("image_file")}
                </div>
                {(["desc_english", "desc_indonesia"] as const).map((name) => (
                  <div key={name} className="grid min-w-0 content-start gap-2">
                    <Label htmlFor={name}>
                      Description (
                      {name === "desc_english" ? "English" : "Indonesia"})
                    </Label>
                    <Textarea
                      id={name}
                      {...register(name)}
                      {...accessibility(name)}
                      rows={4}
                      placeholder="Describe what this item does…"
                    />
                    {fieldError(name)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Item effect</CardTitle>
              <CardDescription>
                Set the gameplay effect applied by this item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="effect">Effect *</Label>
                  <Select
                    id="effect"
                    {...register("effect")}
                    {...accessibility("effect")}
                  >
                    <option value="">Select item effect</option>
                    {effects.map((effect) => (
                      <option key={effect._id} value={effect.name}>
                        {effect.description} ({effect.name})
                      </option>
                    ))}
                  </Select>
                  {fieldError("effect")}
                </div>
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="effect_amount">Effect amount *</Label>
                  <Input id="effect_amount" {...register("effect_amount", { valueAsNumber: true })} {...accessibility("effect_amount")} type="number" min="0" step="1" />
                  {fieldError("effect_amount")}
                </div>
              </div>
            </CardContent>
          </Card>
        </fieldset>
        <FormError message={errors.root?.message}/>
        <div className="flex justify-end gap-3 py-6">
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/admin/items">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            className="min-w-[136px]"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isPending
              ? "Saving…"
              : mode === "edit"
                ? "Update item"
                : "Save item"}
          </Button>
        </div>
      </form>
    </section>
  );
}
