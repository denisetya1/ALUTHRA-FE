export function rewardArrayPath(basePath: string): string {
  return basePath;
}

export function toLocalDateTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function overviewSavePayload(values: Record<string, unknown>): Record<string, unknown> {
  const payload = { ...values };
  for (const key of ["start_at", "end_at", "visibility_start_at", "visibility_end_at"]) {
    const value = values[key];
    if (typeof value === "string" && value) payload[key] = new Date(value).toISOString();
    else if (key.startsWith("visibility_")) delete payload[key];
  }
  return payload;
}
