import { NextRequest } from "next/server";
import { adminMutation } from "@/lib/admin-mutation";
export async function POST(request: NextRequest, { params }: { params: Promise<{ chapterId: string }> }) { const { chapterId } = await params; return adminMutation(request, `/admin/quests/chapters/${chapterId}/regions`, "POST"); }
