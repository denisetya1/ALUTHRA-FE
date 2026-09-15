import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import CardForm, { type CardDefaults } from "../../card-form";
import { loadCardOptions } from "@/lib/admin-master-data";

export default async function EditCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  const [response, options] = await Promise.all([
    fetch(
      `${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/cards/${id}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    ),
    loadCardOptions(token),
  ]);
  if (response.status === 401) redirect("/login");
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load card");
  return (
    <CardForm
      mode="edit"
      cardId={id}
      initialValues={(await response.json()) as CardDefaults}
      {...options}
    />
  );
}
