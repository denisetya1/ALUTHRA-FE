import { NextRequest } from "next/server";
import { adminMutation } from "@/lib/admin-mutation";
export async function POST(request: NextRequest) { return adminMutation(request, "/admin/quests/arcs", "POST"); }
