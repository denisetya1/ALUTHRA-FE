"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemFormSchema, type ItemFormValues } from "./new/schema";
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
import type { EffectOption } from "@/lib/admin-master-data";
import "./new/form.css";

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
      <small id={name + "-error"} className="error" role="alert">
        {errors[name]?.message}
      </small>
    );
  const accessibility = (name: keyof ItemFormValues) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? name + "-error" : undefined,
  });
  const fail = (message: string) => setError("root", { message });
  async function submit(values: ItemFormValues) {
    clearErrors("root");
    const { image_file, ...body } = values;
    const file = image_file?.[0];
    try {
      let image = initialValues?.image ?? "";
      if (file instanceof File && file.size) {
        const upload = new FormData();
        upload.set("file", file);
        upload.set("kind", "items");
        const uploaded = await fetch("/api/admin/uploads", {
          method: "POST",
          body: upload,
        });
        const result = await uploaded.json();
        if (!uploaded.ok) {
          fail(result.message);
          return;
        }
        image = result.url;
      }
      const response = await fetch(
        mode === "edit" ? `/api/admin/items/${itemId}` : "/api/admin/items",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, image }),
        },
      );
      if (!response.ok) {
        const result = await response.json();
        fail(result.message);
        return;
      }
      router.push(`/admin/items?${mode === "edit" ? "updated" : "created"}=1`);
      router.refresh();
    } catch {
      fail(
        "Unable to save. Check your connection and the Items list before retrying.",
      );
    }
  }
  return (
    <section className="item-editor">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/items">
          <ArrowLeft />
          Back to items
        </Link>
      </Button>
      <div className="editor-heading">
        <h1>{mode === "edit" ? "Edit item" : "Add item"}</h1>
        <p className="muted">
          {mode === "edit"
            ? "Update this item and its gameplay effect."
            : "Create an item for your world. Shop pricing is configured separately in the Shop menu."}
        </p>
      </div>
      <form className="item-form" noValidate onSubmit={handleSubmit(submit)}>
        <fieldset disabled={pending} className="editor-fieldset">
          <Card>
            <CardHeader>
              <CardTitle>Item details</CardTitle>
              <CardDescription>
                Name, artwork, and descriptions for each language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="item-fields">
                {(["name_english", "name_indonesia"] as const).map((name) => (
                  <div key={name} className="editor-field">
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
                <div className="editor-field editor-upload">
                  <Label htmlFor="image_file">Item image</Label>
                  <div className="upload-box">
                    <div className="upload-icon">
                      <ImagePlus size={22} />
                    </div>
                    <div className="upload-copy">
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
                  <div key={name} className="editor-field">
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
              <div className="item-fields">
                <div className="editor-field">
                  <Label htmlFor="effect">Effect *</Label>
                  <select
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
                  </select>
                  {fieldError("effect")}
                </div>
                <div className="editor-field">
                  <Label htmlFor="effect_amount">Effect amount *</Label>
                  <Input id="effect_amount" {...register("effect_amount", { valueAsNumber: true })} {...accessibility("effect_amount")} type="number" min="0" step="1" />
                  {fieldError("effect_amount")}
                </div>
              </div>
            </CardContent>
          </Card>
        </fieldset>
        {errors.root && (
          <p className="error" role="alert">
            {errors.root.message}
          </p>
        )}
        <div className="item-form-actions">
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/admin/items">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            className="form-save-button"
            disabled={pending}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {pending
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
