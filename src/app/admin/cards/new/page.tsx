import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadCardOptions } from "@/lib/admin-master-data";
import CardForm from "../card-form";

export default async function NewCard() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  const options = await loadCardOptions(token);
  return <CardForm {...options} />;
}
