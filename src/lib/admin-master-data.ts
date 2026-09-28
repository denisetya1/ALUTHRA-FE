import { adminFetch } from "@/lib/admin-session";

export type RealmOption = {
  _id: string;
  code: string;
  name: string;
  is_active: boolean;
};
export type RarityOption = {
  _id: string;
  tier: number;
  code: string;
  name: string;
  is_active: boolean;
};
export type EffectOption = {
  _id: string;
  name: string;
  description: string;
  is_active: boolean;
};
export type SkillOption = {
  _id: string;
  name: string;
  type: number;
  target: number;
  is_active: boolean;
};
export type ItemOption = {
  _id: string;
  name_english?: string;
  name_indonesia?: string;
};
export type CardOption = { _id: string; name?: string; realm?: string; rarity?: number };
export type PlayerOption = { _id: string; username?: string; email: string };

async function load<T>(path: string): Promise<T[]> {
  const response = await adminFetch(`/admin/${path}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  const result = (await response.json()) as { data: T[] };
  return result.data;
}

export async function loadCardOptions() {
  const [realms, rarities, skills, items] = await Promise.all([
    load<RealmOption>("realms"),
    load<RarityOption>("rarities"),
    load<SkillOption>("card-skills"),
    load<ItemOption>("items/options"),
  ]);
  return {
    realms: realms.filter((option) => option.is_active),
    rarities: rarities.filter((option) => option.is_active),
    skills: skills.filter((option) => option.is_active),
    items,
  };
}

export async function loadRealmOptions() {
  return (await load<RealmOption>("realms")).filter(
    (option) => option.is_active,
  );
}

export async function loadEffectOptions() {
  return (await load<EffectOption>("item-effects")).filter(
    (option) => option.is_active,
  );
}

export async function loadItemOptions() {
  return load<ItemOption>("items/options");
}

export async function loadPresentOptions() {
  const [items, cards, players] = await Promise.all([
    load<ItemOption>("items/options"),
    load<CardOption>("cards/options"),
    load<PlayerOption>("players/options"),
  ]);
  return { items, cards, players };
}
