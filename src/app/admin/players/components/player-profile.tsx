"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePlayer, usePlayerCards } from "@/hooks/use-players";
import DeletePlayerCardButton from "./delete-player-card-button";

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value))
  : "Not set";

export default function PlayerProfile() {
  const id = String(useParams<{ id: string }>().id || "");
  const playerQuery = usePlayer(id);
  const cardsQuery = usePlayerCards(id);
  if (playerQuery.isPending || cardsQuery.isPending) return <section><p>Loading player…</p></section>;
  const player = playerQuery.data;
  const cardsResult = cardsQuery.data;

  if (!player) {
    return (
      <section>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/players"><ArrowLeft /> Back to players</Link>
        </Button>
        <p className="text-sm text-destructive">Player not found.</p>
      </section>
    );
  }

  return (
    <section>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/players"><ArrowLeft /> Back to players</Link>
      </Button>

      <p className="text-xs font-semibold text-muted-foreground">Player profile</p>
      <div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start">
        <div>
          <h1>{player.display_name || player.username || player._id}</h1>
          <p className="text-muted-foreground">{player.email || "No email"} · Realm: {player.realm_id || "Unbound"}</p>
        </div>
      </div>

      <h2 className="mb-4 mt-8">Owned Cards ({cardsResult?.total || 0})</h2>

      {!cardsResult ? (
        <p className="text-sm text-destructive">Unable to load player cards.</p>
      ) : !cardsResult.data.length ? (
        <p className="text-muted-foreground">This player has no cards yet.</p>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-background">
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card</TableHead>
                  <TableHead>Realm</TableHead>
                  <TableHead>Rarity</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Evolution</TableHead>
                  <TableHead>Acquired</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cardsResult.data.map((card) => (
                  <TableRow key={card._id}>
                    <TableCell className="min-w-[230px]">
                      <strong>{card.card_id.name_english || card.card_id.name || card.card_id._id}</strong>
                      <small>{card._id}</small>
                    </TableCell>
                    <TableCell>{card.card_id.realm || "-"}</TableCell>
                    <TableCell>{card.card_id.rarity || "-"}</TableCell>
                    <TableCell>{card.level ?? 1}</TableCell>
                    <TableCell>{card.evolution ?? 1}</TableCell>
                    <TableCell>{formatDate(card.acquired_at)}</TableCell>
                    <TableCell>{card.is_leader ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <DeletePlayerCardButton
                        playerId={id}
                        cardId={card._id}
                        cardName={card.card_id.name_english || card.card_id.name || card.card_id._id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      )}
    </section>
  );
}
