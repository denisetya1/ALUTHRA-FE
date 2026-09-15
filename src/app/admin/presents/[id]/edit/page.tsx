import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { loadPresentOptions } from "@/lib/admin-master-data";
import PresentForm, { type PresentDefaults } from "../../present-form";

export default async function EditPresent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  const [response, options] = await Promise.all([fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/presents/${id}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }), loadPresentOptions(token)]);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load present");
  return <PresentForm mode="edit" presentId={id} initialValues={await response.json() as PresentDefaults} {...options} />;
}
