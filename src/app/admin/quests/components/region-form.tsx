"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { regionSchema, type RegionValues } from "@/schemas/region";
import { useSaveQuestContent } from "@/hooks/use-quests";
import { useUpload } from "@/hooks/use-upload";
import { FormError } from "@/components/admin/page-state";

export default function RegionForm({ mode, arcId, chapterId, regionId, initialValues }: { mode: "add" | "edit"; arcId: string; chapterId: string; regionId?: string; initialValues: RegionValues }) {
  const router = useRouter();
  const saveRegion = useSaveQuestContent();
  const uploadImage = useUpload();
  const back = `/admin/quests/${arcId}/${chapterId}`;
  const { control, register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegionValues>({ resolver: zodResolver(regionSchema), defaultValues: initialValues });
  const fail = (message: string) => { setError("root", { message }); toast.error(message); };
  async function submit(values: RegionValues) {
    try {
      const { image_file, realms_text, ...body } = values;
      let image = initialValues.image;
      const file = image_file?.[0];
      if (file instanceof File && file.size) {
        image = (await uploadImage.mutateAsync({ file, kind: "regions" })).url;
      }
      const endpoint = mode === "add" ? `/api/admin/quests/chapters/${chapterId}/regions` : `/api/admin/quests/regions/${regionId}`;
      await saveRegion.mutateAsync({ endpoint, method: mode === "add" ? "POST" : "PUT", payload: { ...body, realms: realms_text.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean), image } });
      toast.success(mode === "add" ? "Region created successfully." : "Region updated successfully.");
      router.push(back); router.refresh();
    } catch (error) { fail(error instanceof Error ? error.message : mode === "add" ? "Unable to create region." : "Unable to update region."); }
  }
  return <section className="mx-auto max-w-[960px]"><Button variant="ghost" size="sm" asChild><Link href={back}><ArrowLeft />Back to regions</Link></Button><div className="my-6 mb-7"><h1>Edit region</h1><p className="text-muted-foreground">Update names, descriptions, order, visibility, and image.</p></div><form className="mt-6" noValidate onSubmit={handleSubmit(submit, () => toast.error("Please correct the highlighted region fields."))}><fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-6 border-0 p-0 disabled:opacity-65"><Card><CardHeader><CardTitle>Region details</CardTitle><CardDescription>Ordering is applied within this chapter.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1"><div className="grid min-w-0 content-start gap-2"><Label htmlFor="order_number">Order number *</Label><Input id="order_number" type="number" min="1" {...register("order_number", { valueAsNumber: true })}/>{errors.order_number && <small className="text-sm text-destructive">{errors.order_number.message}</small>}</div><div className="grid min-w-0 content-start gap-2"><Label htmlFor="name_english">Name EN *</Label><Input id="name_english" {...register("name_english")}/></div><div className="grid min-w-0 content-start gap-2"><Label htmlFor="name_indonesia">Name ID *</Label><Input id="name_indonesia" {...register("name_indonesia")}/></div><div className="grid min-w-0 content-start gap-2 col-span-full"><Label htmlFor="image_file">Region image</Label>{initialValues.image && <Image className="max-h-[260px] w-full max-w-[520px] rounded-xl object-cover" src={initialValues.image} alt="Current region" width={520} height={260} unoptimized/>}<div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border bg-[var(--page)] p-[22px]"><div className="rounded-lg border border-border bg-background p-3 text-muted-foreground"><ImagePlus size={22}/></div><div className="min-w-0 flex-1"><p>Choose region artwork</p><span>PNG, JPG, or WebP · Up to 5 MB</span></div><Input id="image_file" type="file" accept="image/png,image/jpeg,image/webp" {...register("image_file")}/></div></div><div className="grid min-w-0 content-start gap-2"><Label htmlFor="description_english">Description EN</Label><Textarea id="description_english" rows={4} {...register("description_english")}/></div><div className="grid min-w-0 content-start gap-2"><Label htmlFor="description_indonesia">Description ID</Label><Textarea id="description_indonesia" rows={4} {...register("description_indonesia")}/></div><Controller control={control} name="show" render={({ field }) => <div className="mt-6 flex items-start gap-3 border-t border-border pt-6"><Switch id="show" checked={field.value} onCheckedChange={field.onChange}/><div><Label htmlFor="show">Visible in game</Label><p>{field.value ? "Region is visible." : "Region is hidden."}</p></div></div>}/></div></CardContent></Card></fieldset><FormError message={errors.root?.message}/><div className="flex justify-end gap-3 py-6"><Button variant="outline" size="lg" asChild><Link href={back}>Cancel</Link></Button><Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin"/> : <Save/>}{isSubmitting ? "Saving…" : "Update region"}</Button></div></form></section>;
}
