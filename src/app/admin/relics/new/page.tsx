import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadEffectOptions } from "@/lib/admin-master-data";
import RelicForm from "../relic-form";

export default async function NewRelic() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  return <RelicForm effects={await loadEffectOptions(token)} />;
}
