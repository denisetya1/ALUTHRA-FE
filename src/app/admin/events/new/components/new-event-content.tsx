"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EVENT_TEMPLATES, type EventBaseValues } from "@/schemas/event";
import EventOverviewForm, { type EventOverviewDefaults } from "@/app/admin/events/[id]/components/event-overview-form";

type TemplateKey = keyof typeof EVENT_TEMPLATES;

export function NewEventPageContent() {
  const [template, setTemplate] = useState<TemplateKey | null>(null);

  if (!template) {
    return (
      <section className="mx-auto max-w-[960px]">
        <h1>New event</h1>
        <p className="text-muted-foreground">Pick a starting template — you can enable or disable every module afterwards.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {(Object.keys(EVENT_TEMPLATES) as TemplateKey[]).map((key) => {
            const config = EVENT_TEMPLATES[key];
            const active = template === key;
            return (
              <Card
                key={key}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => setTemplate(key)}
                onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && setTemplate(key)}
                className={`cursor-pointer transition-colors hover:border-primary ${active ? "border-primary" : ""}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {config.label}
                    {active ? <Check className="size-4 text-primary" /> : null}
                  </CardTitle>
                  <CardDescription>
                    {"description" in config && config.description ? config.description : "Start with no modules enabled."}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
    );
  }

  const modules = EVENT_TEMPLATES[template].modules;
  const initialValues: EventOverviewDefaults | undefined =
    modules === null
      ? undefined
      : ({
          modules,
        } as unknown as EventOverviewDefaults);

  return (
    <div className="grid gap-4">
      <div>
        <button type="button" className="text-sm text-primary underline-offset-4 hover:underline" onClick={() => setTemplate(null)}>
          ← Change template
        </button>
        <p className="mt-2 text-sm text-muted-foreground">Template: {EVENT_TEMPLATES[template].label}</p>
      </div>
      <EventOverviewForm initialValues={initialValues} />
    </div>
  );
}

export type { EventBaseValues };
