import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ message: "Invalid card ID." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  try {
    const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/cards/${id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    if (!response.ok) return NextResponse.json({ message: response.status === 400 ? "Check all card fields." : response.status === 404 ? "Card not found." : response.status === 401 ? "Your session expired." : "Unable to update card." }, { status: [400, 401, 404].includes(response.status) ? response.status : 502 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ message: "Unable to reach the backend." }, { status: 502 }); }
}
