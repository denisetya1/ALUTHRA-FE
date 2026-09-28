"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gameConfigSchema, type GameConfigValues } from "./schema";
import type { CardOption } from "@/lib/admin-master-data";
import { useManagedMutation } from "@/lib/react-query";
import "../items/new/form.css";

const STARTING_STAT_FIELDS = [
  ["level", "Level"], ["experience", "EXP"], ["experience_next", "EXP to next level"],
  ["stamina", "CP / Stamina active"], ["stamina_max", "CP / Stamina max"],
  ["valor", "Valor"], ["valor_max", "Valor max"],
  ["fortitude", "Fortitude"], ["fortitude_max", "Fortitude max"],
  ["crown", "Crown"], ["aether", "Aether"], ["honor", "Honor"], ["honor_max", "Honor max"],
  ["attribute_point", "Attribute Point"], ["allies", "Allies"], ["allies_max", "Allies max"],
  ["cards", "Card capacity used"], ["cards_max", "Card capacity max"],
  ["total_win", "Total wins"], ["total_lose", "Total losses"],
  ["charge_meter", "Charge Meter"], ["event_point", "Event Point"],
] as const;

export default function GameConfigForm({ initialValues, cards }: { initialValues: GameConfigValues; cards: CardOption[] }) {
  const router = useRouter();
  const saveConfig = useManagedMutation([["game-config"]]);
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<GameConfigValues>({
    resolver: zodResolver(gameConfigSchema),
    defaultValues: initialValues,
  });
  const onSubmit = handleSubmit((values) => saveConfig.mutateAsync(async () => {
    try {
      const response = await fetch("/api/admin/game-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message || "Unable to save game config.";
        setError("root", { message });
        toast.error(message);
        return;
      }
      toast.success("Game config saved successfully.");
      router.push("/admin/game-config?saved=1");
      router.refresh();
    } catch {
      const message = "Unable to reach the server.";
      setError("root", { message });
      toast.error(message);
    }
  }), () => toast.error("Please correct the highlighted config fields."));

  const pending = isSubmitting || saveConfig.isPending;

  return (
    <section className="item-editor">
      <p className="eyebrow">Game settings</p>
      <h1>Game config</h1>
      <p className="muted">Global values used when players enter ALUTHRA.</p>
      <form onSubmit={onSubmit}>
        <fieldset disabled={pending}>
          <Card>
            <CardHeader><CardTitle>Availability</CardTitle><CardDescription>Control whether players can access the game.</CardDescription></CardHeader>
            <CardContent>
              <div className="shop-option">
                <Controller control={control} name="maintenance_mode" render={({ field }) => (
                  <Checkbox id="maintenance_mode" checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
                )} />
                <div><Label htmlFor="maintenance_mode">Maintenance mode</Label><p>Temporarily prevent players from entering the game.</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>First card by realm</CardTitle><CardDescription>The first card granted after a player chooses their realm.</CardDescription></CardHeader>
            <CardContent className="item-fields">
              {(["solaris", "sylvara", "umbra"] as const).map((realm) => {
                const field = `first_cards.${realm}` as const;
                return <div className="editor-field" key={realm}><Label htmlFor={field} className="capitalize">{realm} first card *</Label><select id={field} {...register(field)}><option value="">Select {realm} card</option>{cards.filter((card) => card.realm?.toLowerCase() === realm).map((card) => <option key={card._id} value={card._id}>{card.name || card._id}</option>)}</select>{errors.first_cards?.[realm] && <small className="error">{errors.first_cards[realm]?.message}</small>}</div>;
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Force update</CardTitle><CardDescription>Require players on older app versions to update before entering the game.</CardDescription></CardHeader>
            <CardContent>
              <div className="item-fields">
                <div className="shop-option config-toggle">
                  <Controller control={control} name="force_update_enabled" render={({ field }) => (
                    <Checkbox id="force_update_enabled" checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
                  )} />
                  <div><Label htmlFor="force_update_enabled">Enable force update</Label><p>Players below the minimum version will be required to update.</p></div>
                </div>
                <div><Label htmlFor="minimum_supported_version">Minimum supported version</Label><Input id="minimum_supported_version" placeholder="1.0.0" {...register("minimum_supported_version")} /><p className="muted">Use x.y.z format. For example, 1.2.0 blocks every version below 1.2.0.</p>{errors.minimum_supported_version && <p className="error">{errors.minimum_supported_version.message}</p>}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Starting player stats</CardTitle><CardDescription>Stats assigned automatically to every newly registered player.</CardDescription></CardHeader>
            <CardContent className="item-fields">
              {STARTING_STAT_FIELDS.map(([key, label]) => {
                const field = `starting_player_stats.${key}` as const;
                const error = errors.starting_player_stats?.[key];
                return <div className="editor-field" key={key}><Label htmlFor={field}>{label}</Label><Input id={field} type="number" min={key === "level" || key === "experience_next" ? 1 : 0} step="1" {...register(field, { valueAsNumber: true })}/>{error && <small className="error">{error.message}</small>}</div>;
              })}
            </CardContent>
          </Card>
        </fieldset>
        {errors.root && <p className="error" role="alert">{errors.root.message}</p>}
        <div className="item-form-actions"><Button type="submit" size="lg" className="form-save-button" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />}{pending ? "Saving…" : "Save config"}</Button></div>
      </form>
    </section>
  );
}
