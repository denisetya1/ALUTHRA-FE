import { NextRequest } from "next/server";
import { adminMutation } from "@/lib/admin-mutation";
export async function POST(request: NextRequest, { params }: { params: Promise<{ regionId: string }> }) { const { regionId } = await params; return adminMutation(request, `/admin/quests/regions/${regionId}/quests`, "POST"); }
