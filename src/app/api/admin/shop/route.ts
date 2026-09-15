import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  try {
    const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/shop`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
    const data = await response.json();
    return NextResponse.json(response.ok ? { ok: true } : { message: data.message || "Unable to save shop item." }, { status: response.ok ? 201 : response.status });
  } catch { return NextResponse.json({ message: "Unable to reach the backend." }, { status: 502 }); }
}
