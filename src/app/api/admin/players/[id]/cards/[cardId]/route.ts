import { NextRequest } from "next/server";
import { adminMutation } from "@/lib/admin-mutation";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; cardId: string }> }) {
  const { id, cardId } = await params;
  return adminMutation(request, `/admin/players/${id}/cards/${cardId}`, "DELETE");
}
