import { NextRequest } from "next/server";
import { adminMutation } from "@/lib/admin-mutation";
export async function POST(request: NextRequest, { params }: { params: Promise<{ arcId: string }> }) { const { arcId } = await params; return adminMutation(request, `/admin/quests/arcs/${arcId}/chapters`, "POST"); }
