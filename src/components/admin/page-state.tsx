import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PageLoading({ label = "Loading data…" }: { label?: string }) {
  return <Card><CardContent className="flex min-h-40 items-center justify-center gap-3 text-muted-foreground"><Loader2 className="size-5 animate-spin"/><span>{label}</span></CardContent></Card>
}

export function PageError({ message = "Unable to load data." }: { message?: string }) {
  return <Card role="alert"><CardHeader><CardTitle>Something went wrong</CardTitle></CardHeader><CardContent className="text-destructive">{message}</CardContent></Card>
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="text-muted-foreground">{description}</CardContent></Card>
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return <p role="alert" className="text-sm text-destructive">{message}</p>
}
