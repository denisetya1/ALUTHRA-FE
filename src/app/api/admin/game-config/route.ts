import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  try {
    const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/game-config`, {
      method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return NextResponse.json({ message: response.status === 400 ? "Check the currency values." : response.status === 401 ? "Your session expired." : "Unable to save config or synchronize Redis." }, { status: [400, 401].includes(response.status) ? response.status : 502 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ message: "Unable to reach the backend." }, { status: 502 }); }
}
