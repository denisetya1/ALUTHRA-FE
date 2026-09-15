import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadEffectOptions } from "@/lib/admin-master-data";
import ItemForm from "../item-form";

export default async function NewItem() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  return <ItemForm effects={await loadEffectOptions(token)} />;
}
