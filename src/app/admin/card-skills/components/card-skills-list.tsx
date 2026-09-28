"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";

import { useCardSkills } from "@/hooks/use-master-data";

const statNames: Record<number, string> = { 1: "Valor", 2: "Fortitude", 3: "Valor & Fortitude" };
const targetNames: Record<number, string> = { 1: "Allies", 2: "Enemies" };

export default function CardSkillsList() {
  const { data: result, isLoading, isError } = useCardSkills();

  return <section>
    <p className="text-xs font-semibold text-muted-foreground">Reference data</p>
    <div className="flex w-full items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start"><div><h1>Card Skills</h1><p className="text-muted-foreground">Battle skills imported from the Varhara master data.</p></div></div>
    {isLoading ? <p role="status">Loading card skills…</p> : isError || !result ? <p role="alert" className="text-sm text-destructive">Unable to load card skills. Check the backend connection and refresh.</p> : (
      <div className="overflow-hidden rounded-[10px] border border-border bg-background"><div className="overflow-auto"><Table className="w-full border-collapse text-left text-xs [&_th]:whitespace-nowrap [&_th]:bg-muted [&_th]:font-medium [&_th]:text-muted-foreground [&_th]:p-4 [&_td]:border-b [&_td]:border-border [&_td]:p-4 [&_td]:align-top">
        <TableCaption className="p-[18px] text-left font-semibold">{result.total} card skills · Source: {result.source}</TableCaption>
        <TableHeader><TableRow>{["No", "Mongo ID", "Legacy ID", "Name", "Skill stat", "Target", "Chance", "Attributes", "Effect", "Effect stat", "Rarity", "Status"].map((name) => <TableHead key={name}>{name}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{result.data.length ? result.data.map((skill, index) => <TableRow key={skill._id}>
          <TableCell>{index + 1}</TableCell><TableCell className="max-w-[150px] overflow-hidden text-ellipsis">{skill._id}</TableCell><TableCell>{skill.legacy_id}</TableCell>
          <TableCell className="min-w-[230px]"><strong>{skill.name}</strong></TableCell><TableCell>{statNames[skill.type] || skill.type}</TableCell>
          <TableCell>{targetNames[skill.target] || skill.target}</TableCell><TableCell>{skill.probability}%</TableCell>
          <TableCell><div className="flex flex-wrap gap-1 [&_span]:rounded-md [&_span]:bg-muted [&_span]:px-2 [&_span]:py-1">{skill.attributes.map((attribute) => <span key={attribute}>{attribute}</span>)}</div></TableCell>
          <TableCell className={skill.effect < 0 ? "negative-effect" : "positive-effect"}>{skill.effect > 0 ? "+" : ""}{skill.effect}{skill.is_value ? "" : "%"}</TableCell>
          <TableCell>{statNames[skill.effect_type] || skill.effect_type}</TableCell><TableCell>{skill.rarity}</TableCell>
          <TableCell><span className="inline-flex rounded-full bg-[var(--primary-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--primary-soft-foreground)]">{skill.is_active ? "Active" : "Inactive"}</span></TableCell>
        </TableRow>) : <TableRow><TableCell colSpan={12} className="p-8 text-center text-muted-foreground">No card skills are available. Refresh after the Varhara import completes.</TableCell></TableRow>}</TableBody>
      </Table></div></div>
    )}
  </section>;
}
