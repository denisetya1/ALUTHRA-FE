import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { loadItemOptions } from "@/lib/admin-master-data";
import ShopForm, { type ShopDefaults } from "../../../shop/shop-form";

export default async function EditShopItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  const [response, items] = await Promise.all([
    fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/shop/${id}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
    loadItemOptions(token),
  ]);
  if (response.status === 401) redirect("/login");
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load shop item");
  const listing = await response.json() as ShopDefaults;
  return <ShopForm mode="edit" listingId={id} initialValues={{ title_english: listing.title_english || "", title_indonesia: listing.title_indonesia || "", items: listing.items, currency: listing.currency || "crown", price: listing.price, discount: listing.discount, image: listing.image, description_english: listing.description_english || "", description_indonesia: listing.description_indonesia || "" }} items={items} />;
}
