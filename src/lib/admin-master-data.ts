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

const baseUrl = process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1";

async function load<T>(path: string, token: string): Promise<T[]> {
  const response = await fetch(`${baseUrl}/admin/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  const result = (await response.json()) as { data: T[] };
  return result.data;
}

export async function loadCardOptions(token: string) {
  const [realms, rarities, skills, items] = await Promise.all([
    load<RealmOption>("realms", token),
    load<RarityOption>("rarities", token),
    load<SkillOption>("card-skills", token),
    load<ItemOption>("items/options", token),
  ]);
  return {
    realms: realms.filter((option) => option.is_active),
    rarities: rarities.filter((option) => option.is_active),
    skills: skills.filter((option) => option.is_active),
    items,
  };
}

export async function loadEffectOptions(token: string) {
  return (await load<EffectOption>("item-effects", token)).filter(
    (option) => option.is_active,
  );
}

export async function loadItemOptions(token: string) {
  return load<ItemOption>("items/options", token);
}

export async function loadPresentOptions(token: string) {
  const [items, cards, players] = await Promise.all([
    load<ItemOption>("items/options", token),
    load<CardOption>("cards/options", token),
    load<PlayerOption>("players/options", token),
  ]);
  return { items, cards, players };
}
