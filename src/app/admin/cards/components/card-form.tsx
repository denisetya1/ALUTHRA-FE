"use client";

import { Select } from "@/components/ui/select";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { ArrowLeft, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cardSchema, type CardValues } from "@/schemas/card";
import type {
  RealmOption,
  RarityOption,
  SkillOption,
  ItemOption,
} from "@/types/admin-options";
import { useSaveCard, type CardDetail } from "@/hooks/use-cards";
import { useUpload } from "@/hooks/use-upload";
import { FormError } from "@/components/admin/page-state";

type ImageVariant = "full" | "default" | "deck" | "thumb";
export type CardDefaults = CardDetail;
const emptyImages = (count: number): CardValues["evolution_images"] =>
  Array.from({ length: count }, () => ({
    full: undefined,
    default: undefined,
    deck: undefined,
    thumb: undefined,
  }));
const normalizeSkills = (value: unknown): CardValues["skills"] =>
  Array.isArray(value)
    ? value.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const skill = entry as Record<string, unknown>;
        const skillId = String(skill.skill_id ?? "");
        const minEvolution = Number(skill.min_evolution);
        return /^[a-f\d]{24}$/i.test(skillId) && Number.isInteger(minEvolution)
          ? [{ skill_id: skillId, min_evolution: minEvolution }]
          : [];
      })
    : [];
const defaults: CardValues = {
  name: "",
  realm: "",
  rarity: 0,
  level: 1,
  level_max: 20,
  cost: 0,
  valor: 0,
  valor_max: 0,
  fortitude: 0,
  fortitude_max: 0,
  evolution: 1,
  evolution_max: 4,
  evolve_cost_crown: 0,
  evolve_materials: [],
  price: 0,
  gacha: false,
  high: false,
  skills: [],
  description_english: "",
  description_indonesia: "",
  evolution_images: emptyImages(4),
};

function ImagePreview({
  files,
  existing,
  label,
}: {
  files?: FileList;
  existing?: string;
  label: string;
}) {
  const file = files?.[0];
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : existing),
    [file, existing],
  );
  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  return preview ? (
    <div className="relative mb-2.5 h-[220px] w-full overflow-hidden rounded-lg border border-border bg-background max-[650px]:h-[200px]">
      <Image
        src={preview}
        alt={label}
        fill
        sizes="(max-width: 650px) 100vw, 35vw"
        unoptimized
      />
    </div>
  ) : (
    <div className="relative mb-2.5 h-[220px] w-full overflow-hidden rounded-lg border border-border bg-background max-[650px]:h-[200px] flex h-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
      <ImagePlus size={24} />
      <span>No image selected</span>
    </div>
  );
}

export default function CardForm({
  mode = "create",
  cardId,
  initialValues,
  realms,
  rarities,
  skills,
  items,
}: {
  mode?: "create" | "edit" | "duplicate";
  cardId?: string;
  initialValues?: CardDefaults;
  realms: RealmOption[];
  rarities: RarityOption[];
  skills: SkillOption[];
  items: ItemOption[];
}) {
  const router = useRouter();
  const saveCard = useSaveCard();
  const uploadImage = useUpload();
  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CardValues>({
    resolver: zodResolver(cardSchema),
    mode: "onBlur",
    defaultValues: {
      ...defaults,
      ...initialValues,
      skills: normalizeSkills(initialValues?.skills),
      evolution_images: emptyImages(initialValues?.evolution_max ?? 4),
    },
  });
  const evolutionMax = useWatch({ control, name: "evolution_max" });
  const {
    fields: materialFields,
    append: appendMaterial,
    remove: removeMaterial,
  } = useFieldArray({ control, name: "evolve_materials" });
  const watchedImages = useWatch({ control, name: "evolution_images" });
  const imageCount = Number.isInteger(evolutionMax)
    ? Math.min(20, Math.max(1, evolutionMax))
    : 1;
  useEffect(() => {
    const current = getValues("evolution_images");
    if (current.length !== imageCount)
      setValue(
        "evolution_images",
        Array.from(
          { length: imageCount },
          (_, index) => current[index] ?? emptyImages(1)[0],
        ),
      );
    const currentSkills = getValues("skills");
    if (currentSkills.some((skill) => skill.min_evolution > imageCount))
      setValue(
        "skills",
        currentSkills.map((skill) => ({
          ...skill,
          min_evolution: Math.min(skill.min_evolution, imageCount),
        })),
      );
  }, [getValues, imageCount, setValue]);
  const error = (name: keyof CardValues) =>
    errors[name] && <small className="text-sm text-destructive">{errors[name]?.message}</small>;
  const numberField = (name: keyof CardValues, label: string, min = 0) => (
    <div className="grid min-w-0 content-start gap-2">
      <Label htmlFor={String(name)}>{label} *</Label>
      <Input
        id={String(name)}
        type="number"
        min={min}
        step="1"
        {...register(name as "cost", { valueAsNumber: true })}
      />
      {error(name)}
    </div>
  );

  async function submit(values: CardValues) {
    clearErrors("root");
    const { evolution_images, ...body } = values;
    try {
      const uploadFile = async (
        file: File,
        variant: ImageVariant,
        evolution: number,
      ) => {
        return (await uploadImage.mutateAsync({ file, kind: "card", name: values.name, size: variant, evolve: evolution })).url;
      };
      const variants: ImageVariant[] = ["full", "default", "deck", "thumb"];
      const images = await Promise.all(
        evolution_images
          .slice(0, values.evolution_max)
          .map(async (files, index) => {
            const evolution = index + 1;
            const existing = initialValues?.images?.find(
              (image) => image.evolution === evolution,
            );
            const uploaded = await Promise.all(
              variants.map(async (variant) => {
                const file = files[variant]?.[0];
                if (file) return uploadFile(file, variant, evolution);
                if (existing?.[variant]) return existing[variant];
                throw new Error(
                  `Evolve ${evolution}: ${variant} image is required.`,
                );
              }),
            );
            return {
              evolution,
              full: uploaded[0],
              default: uploaded[1],
              deck: uploaded[2],
              thumb: uploaded[3],
            };
          }),
      );
      await saveCard.mutateAsync({ id: mode === "edit" ? cardId : undefined, payload: { ...body, images } });
      toast.success(mode === "edit" ? "Card updated successfully." : "Card created successfully.");
      router.push(`/admin/cards?${mode === "edit" ? "updated" : "created"}=1`);
      router.refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to save card.";
      setError("root", { message });
      toast.error(message);
    }
  }

  return (
    <section className="mx-auto max-w-[960px]">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/cards">
          <ArrowLeft />
          Back to cards
        </Link>
      </Button>
      <div className="my-6 mb-7">
        <h1>
          {mode === "edit"
            ? "Edit card"
            : mode === "duplicate"
              ? "Duplicate card"
              : "Add card"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "duplicate"
            ? "Review and edit the copied card data before saving it as a new card."
            : "Configure identity, artwork, progression, and battle stats."}
        </p>
      </div>
      <form className="mt-6" noValidate onSubmit={handleSubmit(submit, () => toast.error("Please correct the highlighted card fields."))}>
        <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-6 border-0 p-0 disabled:opacity-65">
          <Card>
            <CardHeader>
              <CardTitle>Card details</CardTitle>
              <CardDescription>
                Name, realm, rarity, and localized descriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" {...register("name")} />
                  {error("name")}
                </div>
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="realm">Realm *</Label>
                  <Select id="realm" {...register("realm")}>
                    <option value="">Select realm</option>
                    {realms.map((realm) => (
                      <option key={realm._id} value={realm.code}>
                        {realm.name}
                      </option>
                    ))}
                  </Select>
                  {error("realm")}
                </div>
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="rarity">Rarity *</Label>
                  <Select
                    id="rarity"
                    {...register("rarity", { valueAsNumber: true })}
                  >
                    {rarities.map((rarity) => (
                      <option key={rarity._id} value={rarity.tier}>
                        {rarity.name}
                      </option>
                    ))}
                  </Select>
                  {error("rarity")}
                </div>
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="description_english">
                    Description (English)
                  </Label>
                  <Textarea
                    id="description_english"
                    rows={4}
                    {...register("description_english")}
                  />
                  {error("description_english")}
                </div>
                <div className="grid min-w-0 content-start gap-2">
                  <Label htmlFor="description_indonesia">
                    Description (Indonesia)
                  </Label>
                  <Textarea
                    id="description_indonesia"
                    rows={4}
                    {...register("description_indonesia")}
                  />
                  {error("description_indonesia")}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Progression & battle stats</CardTitle>
              <CardDescription>
                Base and maximum values for this card.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
                {numberField("level", "Level", 1)}
                {numberField("level_max", "Max level", 1)}
                {numberField("cost", "Cost")}
                {numberField("price", "Price")}
                {numberField("valor", "Valor")}
                {numberField("valor_max", "Max valor")}
                {numberField("fortitude", "Fortitude")}
                {numberField("fortitude_max", "Max fortitude")}
                {numberField("evolution", "Evolution", 1)}
                {numberField("evolution_max", "Max evolution", 1)}
                {numberField("evolve_cost_crown", "Evolve cost (Crown)")}
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label>Evolve materials</Label>
                    <p className="text-muted-foreground">
                      Optional items consumed when this card evolves.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendMaterial({ item_id: "", amount: 1 })}
                    disabled={!items.length}
                  >
                    <Plus /> Add material
                  </Button>
                </div>
                {materialFields.length ? (
                  <div className="mt-4 grid gap-3">
                    {materialFields.map((field, index) => (
                      <div className="grid grid-cols-[minmax(0,1fr)_minmax(100px,180px)_40px] items-end gap-3 max-[800px]:grid-cols-[minmax(0,1fr)_110px_40px]" key={field.id}>
                        <div className="grid min-w-0 content-start gap-2">
                          <Label htmlFor={`material-${index}`}>Item *</Label>
                          <Select
                            id={`material-${index}`}
                            {...register(`evolve_materials.${index}.item_id`)}
                          >
                            <option value="">Select item</option>
                            {items.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.name_english ||
                                  item.name_indonesia ||
                                  item._id}
                              </option>
                            ))}
                          </Select>
                          {errors.evolve_materials?.[index]?.item_id && (
                            <small className="text-sm text-destructive">
                              {errors.evolve_materials[index]?.item_id?.message}
                            </small>
                          )}
                        </div>
                        <div className="grid min-w-0 content-start gap-2">
                          <Label htmlFor={`material-amount-${index}`}>
                            Amount *
                          </Label>
                          <Input
                            id={`material-amount-${index}`}
                            type="number"
                            min="1"
                            step="1"
                            {...register(`evolve_materials.${index}.amount`, {
                              valueAsNumber: true,
                            })}
                          />
                          {errors.evolve_materials?.[index]?.amount && (
                            <small className="text-sm text-destructive">
                              {errors.evolve_materials[index]?.amount?.message}
                            </small>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove material ${index + 1}`}
                          onClick={() => removeMaterial(index)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">No materials required.</p>
                )}
                {errors.evolve_materials?.message && (
                  <small className="text-sm text-destructive">
                    {errors.evolve_materials.message}
                  </small>
                )}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-6 border-t border-border pt-6 max-[800px]:grid-cols-1">
                {(["gacha", "high"] as const).map((name) => (
                  <div className="mt-6 flex items-start gap-3 border-t border-border pt-6 !m-0 !border-0 !pt-3" key={name}>
                    <Controller
                      control={control}
                      name={name}
                      render={({ field }) => (
                        <Checkbox
                          id={name}
                          checked={field.value}
                          onCheckedChange={(value) =>
                            field.onChange(value === true)
                          }
                        />
                      )}
                    />
                    <div>
                      <Label htmlFor={name}>
                        {name === "gacha"
                          ? "Available in gacha"
                          : "High-tier card"}
                      </Label>
                      <p>
                        {name === "gacha"
                          ? "Allow this card to appear in gacha pools."
                          : "Mark this card as a high-tier unit."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <Label>Card skills</Label>
                <p className="text-muted-foreground">
                  Choose one or more skills from Master Data.
                </p>
                <Controller
                  control={control}
                  name="skills"
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2.5 max-[1000px]:grid-cols-2 max-[800px]:grid-cols-1">
                      {skills.map((skill) => {
                        const selected = field.value.find(
                          (value) => value.skill_id === skill._id,
                        );
                        const checkboxId = `skill-${skill._id}`;
                        return (
                          <div
                            className="block cursor-pointer rounded-lg border border-border p-3 hover:bg-muted"
                            key={skill._id}
                          >
                            <div className="flex items-start gap-2.5">
                              <Checkbox
                                id={checkboxId}
                                checked={Boolean(selected)}
                                onCheckedChange={(checked) =>
                                  field.onChange(
                                    checked === true
                                      ? [
                                          ...field.value,
                                          {
                                            skill_id: skill._id,
                                            min_evolution: 1,
                                          },
                                        ]
                                      : field.value.filter(
                                          (value) =>
                                            value.skill_id !== skill._id,
                                        ),
                                  )
                                }
                              />
                              <Label htmlFor={checkboxId}>
                                <strong>{skill.name}</strong>
                                <small>
                                  Type {skill.type} · Target {skill.target}
                                </small>
                              </Label>
                            </div>
                            {selected && (
                              <div className="mt-3 grid gap-1.5 border-t border-border pt-3">
                                <Label htmlFor={`skill-evolve-${skill._id}`}>
                                  Active from evolve
                                </Label>
                                <Select
                                  id={`skill-evolve-${skill._id}`}
                                  value={selected.min_evolution}
                                  onChange={(event) =>
                                    field.onChange(
                                      field.value.map((value) =>
                                        value.skill_id === skill._id
                                          ? {
                                              ...value,
                                              min_evolution: Number(
                                                event.target.value,
                                              ),
                                            }
                                          : value,
                                      ),
                                    )
                                  }
                                >
                                  {Array.from(
                                    { length: imageCount },
                                    (_, index) => (
                                      <option key={index + 1} value={index + 1}>
                                        Evolve {index + 1}
                                      </option>
                                    ),
                                  )}
                                </Select>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.skills && (
                  <small className="text-sm text-destructive">{errors.skills.message}</small>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Evolution images</CardTitle>
              <CardDescription>
                Upload Full, Default, Deck, and Thumb for every evolution level.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5">
                {Array.from({ length: imageCount }, (_, index) => (
                  <div className="rounded-[10px] border border-border bg-muted p-5" key={index}>
                    <div className="mb-4 flex items-center justify-between">
                      <strong>Evolve {index + 1}</strong>
                      <span>4 required sizes</span>
                    </div>
                    <div className="grid grid-cols-2 gap-5 max-[650px]:grid-cols-1">
                      {(["full", "deck", "default", "thumb"] as const).map(
                        (variant) => {
                          const fieldName =
                            `evolution_images.${index}.${variant}` as const;
                          const existing = initialValues?.images?.find(
                            (image) => image.evolution === index + 1,
                          )?.[variant];
                          return (
                            <div className="grid min-w-0 content-start gap-2" key={variant}>
                              <Label htmlFor={fieldName}>
                                {variant[0].toUpperCase() + variant.slice(1)} *
                              </Label>
                              <ImagePreview
                                files={watchedImages?.[index]?.[variant]}
                                existing={existing}
                                label={`Evolve ${index + 1} ${variant} preview`}
                              />
                              <div className="flex items-center gap-2">
                                <ImagePlus size={18} />
                                <Input
                                  id={fieldName}
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  {...register(fieldName)}
                                />
                              </div>
                              {existing && (
                                <small className="text-[11px] text-muted-foreground">
                                  Current image available · leave empty to keep
                                </small>
                              )}
                              {errors.evolution_images?.[index]?.[variant] && (
                                <small className="text-sm text-destructive">
                                  {
                                    errors.evolution_images[index]?.[variant]
                                      ?.message
                                  }
                                </small>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </fieldset>
        <FormError message={errors.root?.message}/>
        <div className="flex justify-end gap-3 py-6">
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/admin/cards">Cancel</Link>
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
                ? "Update card"
                : "Save card"}
          </Button>
        </div>
      </form>
    </section>
  );
}
