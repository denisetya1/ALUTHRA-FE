"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function ResetPlayerButton({ playerId, playerName }: { playerId: string; playerName: string }) {
  const router = useRouter();
  const resetMutation = useManagedMutation([["players"], ["player", playerId]]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationName, setConfirmationName] = useState("");

  async function resetPlayer() {
    setLoading(true);
    setError("");
    await resetMutation.mutateAsync(async () => { try {
      const response = await fetch(`/api/admin/players/${playerId}/reset`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload.message || "Unable to reset player.";
        setError(message);
        toast.error(message);
        return;
      }
      setOpen(false);
      toast.success(`${playerName} was reset successfully.`);
      router.push("/admin/players?reset=1");
      router.refresh();
    } catch {
      const message = "Unable to reach the server.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    } });
  }

  const confirmed = confirmationName === playerName;
  const pending = loading || resetMutation.isPending;

  return <AlertDialog open={open} onOpenChange={(value) => { if (!pending) { setOpen(value); if (!value) { setError(""); setConfirmationName(""); } } }}>
    <AlertDialogTrigger asChild><Button size="sm"><RotateCcw />Reset</Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Reset player data?</AlertDialogTitle>
        <AlertDialogDescription>This will permanently reset <strong>{playerName}</strong> to the latest starting stats and delete all owned cards, presents, inventory, quest progress, realm selection, and tutorial progress. The account and password will remain active.</AlertDialogDescription>
      </AlertDialogHeader>
      <div className="grid gap-2">
        <Label htmlFor={`confirm-reset-${playerId}`}>Type <strong>{playerName}</strong> to confirm</Label>
        <Input
          id={`confirm-reset-${playerId}`}
          value={confirmationName}
          onChange={(event) => setConfirmationName(event.target.value)}
          placeholder="Enter player name"
          autoComplete="off"
          disabled={pending}
        />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <AlertDialogFooter>
        <AlertDialogCancel asChild><Button type="button" variant="outline" disabled={pending}>Cancel</Button></AlertDialogCancel>
        <Button type="button" variant="destructive" disabled={pending || !confirmed} onClick={resetPlayer}>{pending ? <Loader2 className="animate-spin" /> : <RotateCcw />}{pending ? "Resetting…" : "Yes, reset player"}</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
