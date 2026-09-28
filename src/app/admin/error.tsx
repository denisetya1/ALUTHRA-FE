"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="route-state" role="alert">
      <div>
        <h1>Unable to load this workspace</h1>
        <p>The administration data could not be loaded. Check the backend connection, then try again.</p>
        <Button type="button" onClick={() => retry()}><RotateCcw />Try again</Button>
      </div>
    </section>
  );
}
