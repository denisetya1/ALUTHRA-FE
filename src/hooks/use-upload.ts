"use client";

import { useMutation } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";

type UploadInput = {
  file: File;
  kind: string;
  name?: string;
  size?: string;
  evolve?: number;
};

export function useUpload() {
  return useMutation({
    mutationKey: ["upload"],
    mutationFn: ({ file, kind, name, size, evolve }: UploadInput) => {
      const body = new FormData();
      body.set("file", file);
      body.set("kind", kind);
      if (name) body.set("name", name);
      if (size) body.set("size", size);
      if (evolve !== undefined) body.set("evolve", String(evolve));
      return clientApi<{ url: string }>("/api/admin/uploads", {
        method: "POST",
        body,
      });
    },
  });
}
