import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadPresentOptions } from "@/lib/admin-master-data";
import PresentForm from "../present-form";

export default async function NewPresent() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  return <PresentForm {...await loadPresentOptions(token)} />;
}
