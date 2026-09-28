import { unstable_rethrow } from "next/navigation";
import { adminFetch } from "@/lib/admin-session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import "../../quests/quests.css";
import "../players.css";
import DeletePlayerCardButton from "../delete-player-card-button";

type Player = {
  _id: string;
  display_name?: string;
  username?: string;
  email?: string;
  realm_id?: string;
};

type PlayerCard = {
  _id: string;
  card_id: {
    _id: string;
    name?: string;
    name_english?: string;
    name_indonesia?: string;
    rarity?: string;
    realm?: string;
  };
  level?: number;
  evolution?: number;
  acquired_at?: string;
  is_leader?: boolean;
};

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value))
  : "Not set";

export default async function PlayerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let player: Player | null = null;
  let cardsResult: { data: PlayerCard[]; total: number } | null = null;

  try {
    const [playerRes, cardsRes] = await Promise.all([
      adminFetch(`/admin/players/${id}`, {
        cache: "no-store", signal: AbortSignal.timeout(10000),
      }),
      adminFetch(`/admin/players/${id}/cards`, {
        cache: "no-store", signal: AbortSignal.timeout(10000),
      }),
    ]);
    if (playerRes.ok) player = await playerRes.json();
    if (cardsRes.ok) cardsResult = await cardsRes.json();
  } catch (error) { unstable_rethrow(error); }

  if (!player) {
    return (
      <section>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/players"><ArrowLeft /> Back to players</Link>
        </Button>
        <p className="error">Player not found.</p>
      </section>
    );
  }

  return (
    <section>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/players"><ArrowLeft /> Back to players</Link>
      </Button>

      <p className="eyebrow">Player profile</p>
      <div className="list-heading">
        <div>
          <h1>{player.display_name || player.username || player._id}</h1>
          <p className="muted">{player.email || "No email"} · Realm: {player.realm_id || "Unbound"}</p>
        </div>
      </div>

      <h2 style={{ marginTop: 32, marginBottom: 16 }}>Owned Cards ({cardsResult?.total || 0})</h2>

      {!cardsResult ? (
        <p className="error">Unable to load player cards.</p>
      ) : !cardsResult.data.length ? (
        <p className="muted">This player has no cards yet.</p>
      ) : (
        <div className="quest-table-wrap">
          <div className="quest-table-scroll">
            <table className="quest-table">
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Realm</th>
                  <th>Rarity</th>
                  <th>Level</th>
                  <th>Evolution</th>
                  <th>Acquired</th>
                  <th>Leader</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cardsResult.data.map((card) => (
                  <tr key={card._id}>
                    <td className="quest-name">
                      <strong>{card.card_id.name_english || card.card_id.name || card.card_id._id}</strong>
                      <small>{card._id}</small>
                    </td>
                    <td>{card.card_id.realm || "-"}</td>
                    <td>{card.card_id.rarity || "-"}</td>
                    <td>{card.level ?? 1}</td>
                    <td>{card.evolution ?? 1}</td>
                    <td>{formatDate(card.acquired_at)}</td>
                    <td>{card.is_leader ? "Yes" : "No"}</td>
                    <td>
                      <DeletePlayerCardButton
                        playerId={id}
                        cardId={card._id}
                        cardName={card.card_id.name_english || card.card_id.name || card.card_id._id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
