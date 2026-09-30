"use client";

import { useSearchParams } from "next/navigation";
import { useGameConfig } from "@/hooks/use-game-config";
import { useCardOptions } from "@/hooks/use-admin-options";
import GameConfigForm from "./game-config-form";
import { PageError, PageLoading } from "@/components/admin/page-state";

export default function GameConfigPageContent() {
  const params = useSearchParams();
  const configQuery = useGameConfig();
  const cardsQuery = useCardOptions();
  if (configQuery.isPending || cardsQuery.isPending) return <PageLoading label="Loading configuration…"/>;
  if (configQuery.isError || cardsQuery.isError || !configQuery.data) return <PageError message="Unable to load game config. Check MongoDB and the backend connection."/>;
  const config = { ...configQuery.data, first_cards: { solaris: String(configQuery.data.first_cards?.solaris ?? ""), sylvara: String(configQuery.data.first_cards?.sylvara ?? ""), umbra: String(configQuery.data.first_cards?.umbra ?? "") } };
  return <>{params.get("saved") === "1" && <p role="status">Game config saved and synchronized to Redis.</p>}<GameConfigForm initialValues={config} cards={cardsQuery.data?.data ?? []} /></>;
}
