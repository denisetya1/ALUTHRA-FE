"use client";

import { useQuery, type QueryKey } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";

export function useAdminQuery<T>(queryKey: QueryKey, path: string, enabled = true) {
  return useQuery({
    queryKey,
    queryFn: () => clientApi<T>(`/api/admin/query/${path}`),
    enabled,
  });
}
