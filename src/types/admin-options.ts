export type RealmOption = { _id: string; code: string; name: string; is_active: boolean };
export type RarityOption = { _id: string; tier: number; code: string; name: string; is_active: boolean };
export type EffectOption = { _id: string; name: string; description: string; is_active: boolean };
export type SkillOption = { _id: string; name: string; type: number; target: number; is_active: boolean };
export type ItemOption = { _id: string; name_english?: string; name_indonesia?: string };
export type CardOption = { _id: string; name?: string; realm?: string; rarity?: number };
export type PlayerOption = { _id: string; username?: string; email: string };
