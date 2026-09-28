"use client";

import { useMutation } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";

export function useAdminLogin() {
  return useMutation({
    mutationKey: ["admin-login"],
    mutationFn: (credentials: { email: string; password: string }) =>
      clientApi("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }),
  });
}
