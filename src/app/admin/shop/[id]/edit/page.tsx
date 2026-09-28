import { adminFetch } from "@/lib/admin-session";
import { notFound } from "next/navigation";
import { loadItemOptions } from "@/lib/admin-master-data";
import ShopForm, { type ShopDefaults } from "../../shop-form";

export default async function EditShopItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const [response, items] = await Promise.all([
    adminFetch(
      `/admin/shop/${id}`,
      { cache: "no-store" },
    ),
    loadItemOptions(),
  ]);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load shop item");
  const listing = (await response.json()) as ShopDefaults;
  return (
    <ShopForm
      mode="edit"
      listingId={id}
      initialValues={{
        title_english: listing.title_english || "",
        title_indonesia: listing.title_indonesia || "",
        items: listing.items,
        currency: listing.currency || "crown",
        price: listing.price,
        discount: listing.discount,
        image: listing.image,
        description_english: listing.description_english || "",
        description_indonesia: listing.description_indonesia || "",
      }}
      items={items}
    />
  );
}
