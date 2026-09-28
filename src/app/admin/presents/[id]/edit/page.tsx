import { adminFetch } from "@/lib/admin-session";
import { notFound } from "next/navigation";
import { loadPresentOptions } from "@/lib/admin-master-data";
import PresentForm, { type PresentDefaults } from "../../present-form";

export default async function EditPresent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const [response, options] = await Promise.all([adminFetch(`/admin/presents/${id}`, { cache: "no-store" }), loadPresentOptions()]);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load present");
  return <PresentForm mode="edit" presentId={id} initialValues={await response.json() as PresentDefaults} {...options} />;
}
