"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { cardSchema, type CardValues } from "./schema";
import type {
  RealmOption,
  RarityOption,
  SkillOption,
  ItemOption,
} from "@/lib/admin-master-data";
import "../items/new/form.css";
import "./cards.css";

type ImageVariant = "full" | "default" | "deck" | "thumb";
export type StoredEvolutionImage = {
  evolution: number;
  full: string;
  default: string;
  deck: string;
  thumb: string;
};
export type CardDefaults = Omit<CardValues, "evolution_images"> & {
  images?: StoredEvolutionImage[];
};
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
    <div className="evolution-preview">
      <Image
        src={preview}
        alt={label}
        fill
        sizes="(max-width: 650px) 100vw, 35vw"
        unoptimized
      />
    </div>
  ) : (
    <div className="evolution-preview evolution-preview-empty">
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
  mode?: "create" | "edit";
  cardId?: string;
  initialValues?: CardDefaults;
  realms: RealmOption[];
  rarities: RarityOption[];
  skills: SkillOption[];
  items: ItemOption[];
}) {
  const router = useRouter();
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
    errors[name] && <small className="error">{errors[name]?.message}</small>;
  const numberField = (name: keyof CardValues, label: string, min = 0) => (
    <div className="editor-field">
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
        const upload = new FormData();
        upload.set("file", file);
        upload.set("kind", "card");
        upload.set("name", values.name);
        upload.set("size", variant);
        upload.set("evolve", String(evolution));
        const response = await fetch("/api/admin/uploads", {
          method: "POST",
          body: upload,
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.message || "Unable to upload image.");
        return payload.url as string;
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
      const response = await fetch(
        mode === "edit" ? `/api/admin/cards/${cardId}` : "/api/admin/cards",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, images }),
        },
      );
      const payload = await response.json();
      if (!response.ok) {
        setError("root", { message: payload.message });
        return;
      }
      router.push(`/admin/cards?${mode === "edit" ? "updated" : "created"}=1`);
      router.refresh();
    } catch (cause) {
      setError("root", {
        message:
          cause instanceof Error ? cause.message : "Unable to save card.",
      });
    }
  }

  return (
    <section className="item-editor">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/cards">
          <ArrowLeft />
          Back to cards
        </Link>
      </Button>
      <div className="editor-heading">
        <h1>{mode === "edit" ? "Edit card" : "Add card"}</h1>
        <p className="muted">
          Configure identity, artwork, progression, and battle stats.
        </p>
      </div>
      <form className="item-form" noValidate onSubmit={handleSubmit(submit)}>
        <fieldset disabled={isSubmitting} className="editor-fieldset">
          <Card>
            <CardHeader>
              <CardTitle>Card details</CardTitle>
              <CardDescription>
                Name, realm, rarity, and localized descriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="item-fields">
                <div className="editor-field">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" {...register("name")} />
                  {error("name")}
                </div>
                <div className="editor-field">
                  <Label htmlFor="realm">Realm *</Label>
                  <select id="realm" {...register("realm")}>
                    <option value="">Select realm</option>
                    {realms.map((realm) => (
                      <option key={realm._id} value={realm.code}>
                        {realm.name}
                      </option>
                    ))}
                  </select>
                  {error("realm")}
                </div>
                <div className="editor-field">
                  <Label htmlFor="rarity">Rarity *</Label>
                  <select
                    id="rarity"
                    {...register("rarity", { valueAsNumber: true })}
                  >
                    {rarities.map((rarity) => (
                      <option key={rarity._id} value={rarity.tier}>
                        {rarity.name}
                      </option>
                    ))}
                  </select>
                  {error("rarity")}
                </div>
                <div className="editor-field">
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
                <div className="editor-field">
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
              <div className="item-fields">
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
              <div className="evolve-material-section">
                <div className="evolve-material-heading">
                  <div>
                    <Label>Evolve materials</Label>
                    <p className="muted">
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
                  <div className="evolve-material-list">
                    {materialFields.map((field, index) => (
                      <div className="evolve-material-row" key={field.id}>
                        <div className="editor-field">
                          <Label htmlFor={`material-${index}`}>Item *</Label>
                          <select
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
                          </select>
                          {errors.evolve_materials?.[index]?.item_id && (
                            <small className="error">
                              {errors.evolve_materials[index]?.item_id?.message}
                            </small>
                          )}
                        </div>
                        <div className="editor-field">
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
                            <small className="error">
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
                  <p className="evolve-material-empty">No materials required.</p>
                )}
                {errors.evolve_materials?.message && (
                  <small className="error">
                    {errors.evolve_materials.message}
                  </small>
                )}
              </div>
              <div className="card-options">
                {(["gacha", "high"] as const).map((name) => (
                  <div className="shop-option config-toggle" key={name}>
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
              <div className="master-option-section">
                <Label>Card skills</Label>
                <p className="muted">
                  Choose one or more skills from Master Data.
                </p>
                <Controller
                  control={control}
                  name="skills"
                  render={({ field }) => (
                    <div className="master-checkbox-grid">
                      {skills.map((skill) => {
                        const selected = field.value.find(
                          (value) => value.skill_id === skill._id,
                        );
                        const checkboxId = `skill-${skill._id}`;
                        return (
                          <div
                            className="master-checkbox-option"
                            key={skill._id}
                          >
                            <div className="master-skill-heading">
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
                              <div className="skill-unlock-field">
                                <Label htmlFor={`skill-evolve-${skill._id}`}>
                                  Active from evolve
                                </Label>
                                <select
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
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.skills && (
                  <small className="error">{errors.skills.message}</small>
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
              <div className="evolution-image-list">
                {Array.from({ length: imageCount }, (_, index) => (
                  <div className="evolution-image-group" key={index}>
                    <div className="evolution-image-heading">
                      <strong>Evolve {index + 1}</strong>
                      <span>4 required sizes</span>
                    </div>
                    <div className="evolution-image-grid">
                      {(["full", "deck", "default", "thumb"] as const).map(
                        (variant) => {
                          const fieldName =
                            `evolution_images.${index}.${variant}` as const;
                          const existing = initialValues?.images?.find(
                            (image) => image.evolution === index + 1,
                          )?.[variant];
                          return (
                            <div className="editor-field" key={variant}>
                              <Label htmlFor={fieldName}>
                                {variant[0].toUpperCase() + variant.slice(1)} *
                              </Label>
                              <ImagePreview
                                files={watchedImages?.[index]?.[variant]}
                                existing={existing}
                                label={`Evolve ${index + 1} ${variant} preview`}
                              />
                              <div className="evolution-upload">
                                <ImagePlus size={18} />
                                <Input
                                  id={fieldName}
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  {...register(fieldName)}
                                />
                              </div>
                              {existing && (
                                <small className="existing-image">
                                  Current image available · leave empty to keep
                                </small>
                              )}
                              {errors.evolution_images?.[index]?.[variant] && (
                                <small className="error">
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
        {errors.root && (
          <p className="error" role="alert">
            {errors.root.message}
          </p>
        )}
        <div className="item-form-actions">
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/admin/cards">Cancel</Link>
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
                ? "Update card"
                : "Save card"}
          </Button>
        </div>
      </form>
    </section>
  );
}
