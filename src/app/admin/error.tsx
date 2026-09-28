"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="min-h-[360px] justify-center max-[800px]:min-h-[280px]" role="alert"><CardContent className="flex items-center justify-center gap-4 max-[800px]:items-start max-[800px]:justify-start">
      <div>
        <h1>Unable to load this workspace</h1>
        <p>The administration data could not be loaded. Check the backend connection, then try again.</p>
        <Button type="button" onClick={() => retry()}><RotateCcw />Try again</Button>
      </div>
    </CardContent></Card>
  );
}
