import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token)
    return NextResponse.json(
      { message: "Please sign in again." },
      { status: 401 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) {
      const status = [400, 401, 403, 409].includes(response.status)
        ? response.status
        : 502;
      const message =
        status === 409
          ? "Unable to save due to a data conflict. Please try again."
          : status === 401
            ? "Your session expired. Please sign in again."
            : status === 400
              ? "Check the required fields and numeric values."
              : "Unable to save item. Please try again.";
      return NextResponse.json({ message }, { status });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to reach the backend. Check the Items list before retrying.",
      },
      { status: 502 },
    );
  }
}
