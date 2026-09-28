import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ message: "Invalid player ID." }, { status: 400 });
  try {
    const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/players/${id}/reset`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ message: payload.message || "Unable to reset player." }, { status: [400, 401, 404].includes(response.status) ? response.status : 502 });
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ message: "Unable to reach the backend." }, { status: 502 });
  }
}
