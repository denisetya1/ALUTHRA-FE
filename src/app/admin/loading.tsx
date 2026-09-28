import { Card, CardContent } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <Card className="min-h-[360px] justify-center max-[800px]:min-h-[280px]" aria-live="polite" aria-busy="true"><CardContent className="flex items-center justify-center gap-4 max-[800px]:items-start max-[800px]:justify-start">
      <div className="size-[22px] shrink-0 animate-spin rounded-full border-[3px] border-border border-t-primary motion-reduce:animate-none" aria-hidden="true" />
      <div>
        <h1>Loading workspace</h1>
        <p>Fetching the latest ALUTHRA administration data.</p>
      </div>
    </CardContent></Card>
  );
}
