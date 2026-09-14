import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ItemForm, { type ItemDefaults } from "../../item-form";
export default async function EditItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  const response = await fetch(
    `${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/items/${id}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (response.status === 401) redirect("/login");
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load item");
  return (
    <ItemForm
      mode="edit"
      itemId={id}
      initialValues={(await response.json()) as ItemDefaults}
    />
  );
}
