"use client";

import { useAdminQuery } from "@/hooks/use-admin-query";
import type { CardOption, ItemOption, PlayerOption } from "@/types/admin-options";

type ListResult<T> = { data: T[]; total?: number };

export const useItemOptions = () =>
  useAdminQuery<ListResult<ItemOption>>(["item-options"], "items/options");
export const useCardOptions = () =>
  useAdminQuery<ListResult<CardOption>>(["card-options"], "cards/options");
export const usePlayerOptions = () =>
  useAdminQuery<ListResult<PlayerOption>>(["player-options"], "players/options");
