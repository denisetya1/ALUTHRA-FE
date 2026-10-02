import { NextRequest, NextResponse } from "next/server";
import { adminMutation } from "@/lib/admin-mutation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return NextResponse.json({ message: "Invalid event ID." }, { status: 400 });
  }
  return adminMutation(request, `admin/events/${id}`, "PUT");
}
