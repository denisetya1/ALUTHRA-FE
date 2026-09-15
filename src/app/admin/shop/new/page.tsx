import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadItemOptions } from "@/lib/admin-master-data";
import ShopForm from "../shop-form";

export default async function NewShopItem() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  return <ShopForm items={await loadItemOptions(token)} />;
}
