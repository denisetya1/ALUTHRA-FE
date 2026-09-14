"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { relicSchema, type RelicValues } from "./new/schema";
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
import "../items/new/form.css";
export type RelicDefaults = Omit<RelicValues, "image_file"> & {
  image?: string;
};
export default function RelicForm({
  mode = "create",
  relicId,
  initialValues,
}: {
  mode?: "create" | "edit";
  relicId?: string;
  initialValues?: RelicDefaults;
}) {
  const router = useRouter();
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
    errors[n] && <small className="error">{errors[n]?.message}</small>;
  async function submit(values: RelicValues) {
    clearErrors("root");
    const { image_file, ...body } = values;
    try {
      let image = initialValues?.image ?? "";
      const file = image_file?.[0];
      if (file) {
        const upload = new FormData();
        upload.set("file", file);
        const res = await fetch("/api/admin/uploads", {
          method: "POST",
          body: upload,
        });
        const json = await res.json();
        if (!res.ok) {
          setError("root", { message: json.message });
          return;
        }
        image = json.url;
      }
      const res = await fetch(
        mode === "edit" ? `/api/admin/relics/${relicId}` : "/api/admin/relics",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, image }),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        setError("root", { message: json.message });
        return;
      }
      router.push(`/admin/relics?${mode === "edit" ? "updated" : "created"}=1`);
      router.refresh();
    } catch {
      setError("root", { message: "Unable to save relic." });
    }
  }
  return (
    <section className="item-editor">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/relics">
          <ArrowLeft />
          Back to relics
        </Link>
      </Button>
      <div className="editor-heading">
        <h1>{mode === "edit" ? "Edit relic" : "Add relic"}</h1>
        <p className="muted">
          {mode === "edit"
            ? "Update this relic and its gameplay effect."
            : "Create a relic and configure its gameplay effect."}
        </p>
      </div>
      <form className="item-form" noValidate onSubmit={handleSubmit(submit)}>
        <fieldset disabled={isSubmitting} className="editor-fieldset">
          <Card>
            <CardHeader>
              <CardTitle>Relic details</CardTitle>
              <CardDescription>
                Names, artwork, and descriptions for each language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="item-fields">
                {(["name_english", "name_indonesia"] as const).map((n) => (
                  <div className="editor-field" key={n}>
                    <Label htmlFor={n}>
                      Name ({n.endsWith("english") ? "English" : "Indonesia"})
                      {n.endsWith("english") ? " *" : ""}
                    </Label>
                    <Input id={n} {...register(n)} />
                    {err(n)}
                  </div>
                ))}
                <div className="editor-field editor-upload">
                  <Label htmlFor="image_file">Relic image</Label>
                  <div className="upload-box">
                    <div className="upload-icon">
                      <ImagePlus size={22} />
                    </div>
                    <div className="upload-copy">
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
                  <div className="editor-field" key={n}>
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
              <div className="item-fields">
                <div className="editor-field">
                  <Label htmlFor="effect">Effect *</Label>
                  <Input
                    id="effect"
                    placeholder="Effect key"
                    {...register("effect")}
                  />
                  {err("effect")}
                </div>
                {(["effect_amount", "price", "discount"] as const).map((n) => (
                  <div className="editor-field" key={n}>
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
              <div className="shop-option">
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
        {errors.root && <p className="error">{errors.root.message}</p>}
        <div className="item-form-actions">
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/admin/relics">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            className="form-save-button"
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
