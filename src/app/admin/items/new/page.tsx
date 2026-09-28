import { loadEffectOptions } from "@/lib/admin-master-data";
import ItemForm from "../item-form";

export default async function NewItem() {
  return <ItemForm effects={await loadEffectOptions()} />;
}
