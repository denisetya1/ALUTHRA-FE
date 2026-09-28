import { adminFetch } from "@/lib/admin-session";
import { notFound } from "next/navigation";
import CardForm, { type CardDefaults } from "../../card-form";
import { loadCardOptions } from "@/lib/admin-master-data";

export default async function DuplicateCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();

  const [response, options] = await Promise.all([
    adminFetch(
      `/admin/cards/${id}`,
      { cache: "no-store" },
    ),
    loadCardOptions(),
  ]);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load card");

  return (
    <CardForm
      mode="duplicate"
      initialValues={(await response.json()) as CardDefaults}
      {...options}
    />
  );
}
