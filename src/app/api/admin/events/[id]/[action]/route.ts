import { NextRequest, NextResponse } from "next/server";
import { adminMutation } from "@/lib/admin-mutation";

type Action = "publish" | "disable" | "archive" | "duplicate";
const actions: Action[] = ["publish", "disable", "archive", "duplicate"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await params;
  if (!/^[a-f\d]{24}$/i.test(id) || !actions.includes(action as Action)) {
    return NextResponse.json({ message: "Invalid event action." }, { status: 400 });
  }
  return adminMutation(request, `admin/events/${id}/${action}`, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await params;
  if (action !== "edit" || !/^[a-f\d]{24}$/i.test(id)) {
    return NextResponse.json({ message: "Invalid event ID." }, { status: 400 });
  }
  return adminMutation(request, `admin/events/${id}`, "PUT");
}
