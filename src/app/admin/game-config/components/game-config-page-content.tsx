"use client";

import { useSearchParams } from "next/navigation";
import { useGameConfig } from "@/hooks/use-game-config";
import { useCardOptions } from "@/hooks/use-admin-options";
import GameConfigForm from "./game-config-form";

export default function GameConfigPageContent() {
  const params = useSearchParams();
  const configQuery = useGameConfig();
  const cardsQuery = useCardOptions();
  if (configQuery.isPending || cardsQuery.isPending) return <section><h1>Game config</h1><p>Loading configuration…</p></section>;
  if (configQuery.isError || cardsQuery.isError || !configQuery.data) return <section><h1>Game config</h1><p className="text-sm text-destructive">Unable to load game config. Check MongoDB and the backend connection.</p></section>;
  const config = { ...configQuery.data, first_cards: { solaris: String(configQuery.data.first_cards?.solaris ?? ""), sylvara: String(configQuery.data.first_cards?.sylvara ?? ""), umbra: String(configQuery.data.first_cards?.umbra ?? "") } };
  return <>{params.get("saved") === "1" && <p role="status">Game config saved and synchronized to Redis.</p>}<GameConfigForm initialValues={config} cards={cardsQuery.data?.data ?? []} /></>;
}
