import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GameConfigForm from "./game-config-form";
import type { GameConfigValues } from "./schema";
import { loadPresentOptions } from "@/lib/admin-master-data";

export default async function GameConfigPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const params = await searchParams;
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  let config: GameConfigValues | null = null;
  let cards: Awaited<ReturnType<typeof loadPresentOptions>>["cards"] = [];
  try {
    const [response, options] = await Promise.all([fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/game-config`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
    }), loadPresentOptions(token)]);
    cards = options.cards;
    if (response.status === 401) redirect("/login");
    if (response.ok) config = await response.json();
  } catch {}
  if (!config) return <section><h1>Game config</h1><p className="error">Unable to load game config. Check MongoDB and the backend connection.</p></section>;
  config.first_cards = {
    solaris: String(config.first_cards?.solaris ?? ""),
    sylvara: String(config.first_cards?.sylvara ?? ""),
    umbra: String(config.first_cards?.umbra ?? ""),
  };
  return <>{params.saved === "1" && <p role="status">Game config saved and synchronized to Redis.</p>}<GameConfigForm initialValues={config} cards={cards} /></>;
}
