import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return <div className="relative"><select data-slot="select" className={cn("h-10 w-full appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>{children}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/></div>
}

export { Select }
