import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function adminMutation(request: NextRequest, path: string, method: "POST" | "PUT" | "DELETE") {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  try { const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}${path}`, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, ...(method === "DELETE" ? {} : { body: JSON.stringify(await request.json()) }) }); const result = await response.json().catch(() => null); return NextResponse.json(response.ok ? result : { message: result?.message || "Unable to save." }, { status: response.status }); } catch { return NextResponse.json({ message: "Unable to reach backend." }, { status: 502 }); }
}
