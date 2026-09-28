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
import { gameConfigSchema, type GameConfigValues } from "@/schemas/game-config";
import type { CardOption } from "@/lib/admin-master-data";
import { useSaveGameConfig } from "@/hooks/use-game-config";

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
  const saveConfig = useSaveGameConfig();
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<GameConfigValues>({
    resolver: zodResolver(gameConfigSchema),
    defaultValues: initialValues,
  });
  const onSubmit = handleSubmit(async (values) => {
    try {
      await saveConfig.mutateAsync(values);
      toast.success("Game config saved successfully.");
      router.push("/admin/game-config?saved=1");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reach the server.";
      setError("root", { message });
      toast.error(message);
    }
  }, () => toast.error("Please correct the highlighted config fields."));

  const pending = isSubmitting || saveConfig.isPending;

  return (
    <section className="mx-auto max-w-[960px]">
      <p className="text-xs font-semibold text-muted-foreground">Game settings</p>
      <h1>Game config</h1>
      <p className="text-muted-foreground">Global values used when players enter ALUTHRA.</p>
      <form onSubmit={onSubmit}>
        <fieldset disabled={pending}>
          <Card>
            <CardHeader><CardTitle>Availability</CardTitle><CardDescription>Control whether players can access the game.</CardDescription></CardHeader>
            <CardContent>
              <div className="mt-6 flex items-start gap-3 border-t border-border pt-6">
                <Controller control={control} name="maintenance_mode" render={({ field }) => (
                  <Checkbox id="maintenance_mode" checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
                )} />
                <div><Label htmlFor="maintenance_mode">Maintenance mode</Label><p>Temporarily prevent players from entering the game.</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>First card by realm</CardTitle><CardDescription>The first card granted after a player chooses their realm.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
              {(["solaris", "sylvara", "umbra"] as const).map((realm) => {
                const field = `first_cards.${realm}` as const;
                return <div className="grid min-w-0 content-start gap-2" key={realm}><Label htmlFor={field} className="capitalize">{realm} first card *</Label><select id={field} {...register(field)}><option value="">Select {realm} card</option>{cards.filter((card) => card.realm?.toLowerCase() === realm).map((card) => <option key={card._id} value={card._id}>{card.name || card._id}</option>)}</select>{errors.first_cards?.[realm] && <small className="text-sm text-destructive">{errors.first_cards[realm]?.message}</small>}</div>;
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Force update</CardTitle><CardDescription>Require players on older app versions to update before entering the game.</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
                <div className="mt-6 flex items-start gap-3 border-t border-border pt-6 !m-0 !border-0 !pt-3">
                  <Controller control={control} name="force_update_enabled" render={({ field }) => (
                    <Checkbox id="force_update_enabled" checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
                  )} />
                  <div><Label htmlFor="force_update_enabled">Enable force update</Label><p>Players below the minimum version will be required to update.</p></div>
                </div>
                <div><Label htmlFor="minimum_supported_version">Minimum supported version</Label><Input id="minimum_supported_version" placeholder="1.0.0" {...register("minimum_supported_version")} /><p className="text-muted-foreground">Use x.y.z format. For example, 1.2.0 blocks every version below 1.2.0.</p>{errors.minimum_supported_version && <p className="text-sm text-destructive">{errors.minimum_supported_version.message}</p>}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Starting player stats</CardTitle><CardDescription>Stats assigned automatically to every newly registered player.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
              {STARTING_STAT_FIELDS.map(([key, label]) => {
                const field = `starting_player_stats.${key}` as const;
                const error = errors.starting_player_stats?.[key];
                return <div className="grid min-w-0 content-start gap-2" key={key}><Label htmlFor={field}>{label}</Label><Input id={field} type="number" min={key === "level" || key === "experience_next" ? 1 : 0} step="1" {...register(field, { valueAsNumber: true })}/>{error && <small className="text-sm text-destructive">{error.message}</small>}</div>;
              })}
            </CardContent>
          </Card>
        </fieldset>
        {errors.root && <p className="text-sm text-destructive" role="alert">{errors.root.message}</p>}
        <div className="flex justify-end gap-3 py-6"><Button type="submit" size="lg" className="min-w-[136px]" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />}{pending ? "Saving…" : "Save config"}</Button></div>
      </form>
    </section>
  );
}
