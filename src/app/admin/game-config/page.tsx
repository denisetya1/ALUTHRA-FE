import { unstable_rethrow } from "next/navigation";
import { adminFetch } from "@/lib/admin-session";
import GameConfigForm from "./game-config-form";
import type { GameConfigValues } from "./schema";
import { loadPresentOptions } from "@/lib/admin-master-data";

export default async function GameConfigPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const params = await searchParams;
  let config: GameConfigValues | null = null;
  let cards: Awaited<ReturnType<typeof loadPresentOptions>>["cards"] = [];
  try {
    const [response, options] = await Promise.all([adminFetch(`/admin/game-config`, {
      cache: "no-store", signal: AbortSignal.timeout(10000),
    }), loadPresentOptions()]);
    cards = options.cards;
    if (response.ok) config = await response.json();
  } catch (error) { unstable_rethrow(error); }
  if (!config) return <section><h1>Game config</h1><p className="error">Unable to load game config. Check MongoDB and the backend connection.</p></section>;
  config.first_cards = {
    solaris: String(config.first_cards?.solaris ?? ""),
    sylvara: String(config.first_cards?.sylvara ?? ""),
    umbra: String(config.first_cards?.umbra ?? ""),
  };
  return <>{params.saved === "1" && <p role="status">Game config saved and synchronized to Redis.</p>}<GameConfigForm initialValues={config} cards={cards} /></>;
}
