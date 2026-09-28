"use client";

import { useAdminQuery } from "@/hooks/use-admin-query";

export type Realm = { _id: string; code: string; name: string; is_active: boolean };
export type Rarity = { _id: string; tier: number; code: string; name: string; is_active: boolean };
export type ItemEffect = { _id: string; legacy_id: number; name: string; description: string; is_active: boolean };
export type CardSkill = { _id: string; legacy_id: number; name: string; type: number; target: number; probability: number; attributes: string[]; effect: number; is_value: boolean; effect_type: number; rarity: number; is_active: boolean };

type ListResult<T> = { data: T[]; total: number; source?: string };

export const useRealms = () => useAdminQuery<ListResult<Realm>>(["realms"], "realms");
export const useRarities = () => useAdminQuery<ListResult<Rarity>>(["rarities"], "rarities");
export const useItemEffects = () => useAdminQuery<ListResult<ItemEffect>>(["item-effects"], "item-effects");
export const useCardSkills = () => useAdminQuery<ListResult<CardSkill>>(["card-skills"], "card-skills");
