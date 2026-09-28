"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useManagedMutation } from "@/lib/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeletePlayerCardButton({ playerId, cardId, cardName }: { playerId: string; cardId: string; cardName: string }) {
  const router = useRouter();
  const deleteMutation = useManagedMutation([["player", playerId]]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deleteCard() {
    setLoading(true);
    setError("");
    await deleteMutation.mutateAsync(async () => { try {
      const response = await fetch(`/api/admin/players/${playerId}/cards/${cardId}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload.message || "Unable to delete card.";
        setError(message);
        toast.error(message);
        return;
      }
      setOpen(false);
      toast.success(`${cardName} removed from player`);
      router.refresh();
    } catch {
      const message = "Unable to reach the server.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    } });
  }

  const pending = loading || deleteMutation.isPending;

  return <AlertDialog open={open} onOpenChange={(value) => { if (!pending) { setOpen(value); if (!value) setError(""); } }}>
    <AlertDialogTrigger asChild><Button size="xs" variant="destructive"><Trash2 size={14} /></Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove this card?</AlertDialogTitle>
        <AlertDialogDescription>This will permanently remove <strong>{cardName}</strong> from this player. This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      {error && <p className="error" role="alert">{error}</p>}
      <AlertDialogFooter>
        <AlertDialogCancel asChild><Button type="button" variant="outline" disabled={pending}>Cancel</Button></AlertDialogCancel>
        <Button type="button" variant="destructive" disabled={pending} onClick={deleteCard}>{pending ? <Loader2 className="animate-spin" /> : <Trash2 size={14} />}{pending ? "Deleting…" : "Yes, remove card"}</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
