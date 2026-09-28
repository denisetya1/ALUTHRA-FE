import { adminFetch } from "@/lib/admin-session";
import { notFound } from "next/navigation";
import ItemForm, { type ItemDefaults } from "../../item-form";
import { loadEffectOptions } from "@/lib/admin-master-data";
export default async function EditItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const [response, effects] = await Promise.all([
    adminFetch(
      `/admin/items/${id}`,
      { cache: "no-store" },
    ),
    loadEffectOptions(),
  ]);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load item");
  return (
    <ItemForm
      mode="edit"
      itemId={id}
      initialValues={(await response.json()) as ItemDefaults}
      effects={effects}
    />
  );
}
