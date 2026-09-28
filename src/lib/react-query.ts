"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

type MutationTask<T> = () => Promise<T>;

export function useManagedMutation<T = void>(invalidate: QueryKey[] = []) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: MutationTask<T>) => task(),
    onSuccess: async () => {
      await Promise.all(
        invalidate.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
}

export async function apiResponse<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => null)) as T | null;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : "Request failed.";
    throw new Error(message);
  }
  return payload as T;
}
