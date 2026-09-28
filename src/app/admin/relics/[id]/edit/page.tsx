import { adminFetch } from "@/lib/admin-session";
import { notFound } from "next/navigation";
import RelicForm, { type RelicDefaults } from "../../relic-form";
import { loadEffectOptions } from "@/lib/admin-master-data";
export default async function EditRelic({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const [response, effects] = await Promise.all([
    adminFetch(
      `/admin/relics/${id}`,
      { cache: "no-store" },
    ),
    loadEffectOptions(),
  ]);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load relic");
  return (
    <RelicForm
      mode="edit"
      relicId={id}
      initialValues={(await response.json()) as RelicDefaults}
      effects={effects}
    />
  );
}
