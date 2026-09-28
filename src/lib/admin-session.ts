import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE_URL =
  process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1";

async function readAdminToken() {
  return (await cookies()).get("admin_session")?.value;
}

function isValidAdminToken(token: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    ) as { exp?: number; role?: string };
    return payload.role === "admin" &&
      typeof payload.exp === "number" &&
      payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdminSession() {
  const token = await readAdminToken();
  if (!token || !isValidAdminToken(token)) redirect("/login");
  return token;
}

export async function adminFetch(path: string, init: RequestInit = {}) {
  const token = await requireAdminSession();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

  if (response.status === 401) redirect("/login");
  return response;
}
