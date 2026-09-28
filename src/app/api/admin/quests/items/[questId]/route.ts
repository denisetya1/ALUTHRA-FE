import { NextRequest } from "next/server";
import { adminMutation } from "@/lib/admin-mutation";
export async function PUT(request: NextRequest, { params }: { params: Promise<{ questId: string }> }) { const { questId } = await params; return adminMutation(request, `/admin/quests/items/${questId}`, "PUT"); }
