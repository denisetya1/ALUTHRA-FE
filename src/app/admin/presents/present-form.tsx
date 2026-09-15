"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CardOption, ItemOption, PlayerOption } from "@/lib/admin-master-data";
import { presentSchema, type PresentValues } from "./schema";
import "../items/new/form.css";
import "../cards/cards.css";

export type PresentDefaults = Omit<PresentValues, "image_file"> & { image?: string };
export default function PresentForm({ mode = "create", presentId, initialValues, items, cards, players }: { mode?: "create" | "edit"; presentId?: string; initialValues?: PresentDefaults; items: ItemOption[]; cards: CardOption[]; players: PlayerOption[] }) {
  const router = useRouter();
  const { control, register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<PresentValues>({ resolver: zodResolver(presentSchema), defaultValues: initialValues ?? { title: "", player_id: "", status: "unclaimed", items: [], cards: [], gacha: 0, gold: 0, aether: 0 } });
  const itemFields = useFieldArray({ control, name: "items" });
  const cardFields = useFieldArray({ control, name: "cards" });
  async function submit(values: PresentValues) {
    try {
      const { image_file, ...body } = values;
      let image = initialValues?.image ?? "";
      if (image_file?.[0]) { const data = new FormData(); data.set("file", image_file[0]); data.set("kind", "presents"); const response = await fetch("/api/admin/uploads", { method: "POST", body: data }); const result = await response.json(); if (!response.ok) return setError("root", { message: result.message }); image = result.url; }
      const response = await fetch(mode === "edit" ? `/api/admin/presents/${presentId}` : "/api/admin/presents", { method: mode === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, image }) });
      const result = await response.json(); if (!response.ok) return setError("root", { message: result.message || "Unable to save present." });
      router.push(`/admin/presents?${mode === "edit" ? "updated" : "created"}=1`); router.refresh();
    } catch { setError("root", { message: "Unable to save present." }); }
  }
  const rewards = (kind: "items" | "cards") => {
    const fields = kind === "items" ? itemFields.fields : cardFields.fields;
    const options = kind === "items" ? items : cards;
    const append = kind === "items" ? itemFields.append : cardFields.append;
    const remove = kind === "items" ? itemFields.remove : cardFields.remove;
    return <div className="editor-field editor-upload"><div className="evolve-material-heading"><div><Label>{kind === "items" ? "Items" : "Cards"}</Label><p className="muted">Optional rewards with quantity.</p></div><Button type="button" variant="outline" size="sm" onClick={() => append({ id: "", quantity: 1 })}><Plus />Add {kind === "items" ? "item" : "card"}</Button></div><div className="evolve-material-list">{fields.map((field, index) => <div className="evolve-material-row" key={field.id}><div className="editor-field"><Label>Reward *</Label><select {...register(`${kind}.${index}.id` as const)}><option value="">Select {kind === "items" ? "item" : "card"}</option>{options.map((option) => <option key={option._id} value={option._id}>{kind === "cards" ? (option as CardOption).name : (option as ItemOption).name_english || (option as ItemOption).name_indonesia || option._id}</option>)}</select></div><div className="editor-field"><Label>Quantity *</Label><Input type="number" min="1" {...register(`${kind}.${index}.quantity` as const, { valueAsNumber: true })}/></div><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label={`Remove ${kind} reward`}><Trash2 /></Button></div>)}</div>{errors[kind]?.message && <small className="error">{errors[kind]?.message}</small>}</div>;
  };
  return <section className="item-editor"><Button variant="ghost" size="sm" asChild><Link href="/admin/presents"><ArrowLeft />Back to presents</Link></Button><div className="editor-heading"><h1>{mode === "edit" ? "Edit present" : "Add present"}</h1><p className="muted">Send a reward package to a player.</p></div><form className="item-form" noValidate onSubmit={handleSubmit(submit)}><fieldset disabled={isSubmitting} className="editor-fieldset"><Card><CardHeader><CardTitle>Present details</CardTitle><CardDescription>Recipient, status, artwork, and rewards.</CardDescription></CardHeader><CardContent><div className="item-fields">
    <div className="editor-field"><Label htmlFor="title">Title *</Label><Input id="title" {...register("title")}/>{errors.title && <small className="error">{errors.title.message}</small>}</div>
    <div className="editor-field"><Label htmlFor="player_id">Player *</Label><select id="player_id" {...register("player_id")}><option value="">Select player</option>{players.map((player) => <option key={player._id} value={player._id}>{player.username || player.email} · {player.email}</option>)}</select>{errors.player_id && <small className="error">{errors.player_id.message}</small>}</div>
    <div className="editor-field"><Label htmlFor="status">Status *</Label><select id="status" {...register("status")}><option value="unclaimed">Unclaimed</option><option value="claimed">Claimed</option></select></div>
    <div className="editor-field editor-upload"><Label htmlFor="image_file">Present image</Label><div className="upload-box"><div className="upload-icon"><ImagePlus size={22}/></div><div className="upload-copy"><p>Choose present artwork</p><span>PNG, JPG, or WebP · Up to 5 MB{initialValues?.image ? " · Leave empty to keep current image" : ""}</span></div><Input id="image_file" type="file" accept="image/png,image/jpeg,image/webp" {...register("image_file")}/></div>{errors.image_file && <small className="error">{errors.image_file.message}</small>}</div>
    {rewards("items")}{rewards("cards")}
    {(["gacha", "gold", "aether"] as const).map((name) => <div className="editor-field" key={name}><Label htmlFor={name}>{name === "gold" ? "Gold (Crown)" : name[0].toUpperCase() + name.slice(1)} *</Label><Input id={name} type="number" min="0" step="1" {...register(name, { valueAsNumber: true })}/>{errors[name] && <small className="error">{errors[name]?.message}</small>}</div>)}
  </div></CardContent></Card></fieldset>{errors.root && <p className="error">{errors.root.message}</p>}<div className="item-form-actions"><Button type="button" variant="outline" size="lg" asChild><Link href="/admin/presents">Cancel</Link></Button><Button type="submit" size="lg" className="form-save-button" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin"/> : <Save />}{isSubmitting ? "Saving…" : mode === "edit" ? "Update present" : "Save present"}</Button></div></form></section>;
}
