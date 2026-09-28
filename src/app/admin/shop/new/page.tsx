import { loadItemOptions } from "@/lib/admin-master-data";
import ShopForm from "../shop-form";

export default async function NewShopItem() {
  return <ShopForm items={await loadItemOptions()} />;
}
