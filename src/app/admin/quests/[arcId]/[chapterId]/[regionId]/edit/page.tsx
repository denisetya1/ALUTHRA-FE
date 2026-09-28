import { adminFetch } from "@/lib/admin-session";
import { notFound } from "next/navigation";
import RegionForm from "./region-form";
import type { RegionValues } from "./schema";

export default async function EditRegion({ params }: { params: Promise<{ arcId: string; chapterId: string; regionId: string }> }) {
  const { arcId, chapterId, regionId } = await params;
  if (![arcId, chapterId, regionId].every((id) => /^[a-f\d]{24}$/i.test(id))) notFound();
  const response = await adminFetch(`/admin/quests/regions/${regionId}`, { cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Unable to load region");
  const region = await response.json() as RegionValues;
  return <RegionForm mode="edit" arcId={arcId} chapterId={chapterId} regionId={regionId} initialValues={{ source_id: region.source_id, order_number: region.order_number, name_english: region.name_english, name_indonesia: region.name_indonesia, description_english: region.description_english || "", description_indonesia: region.description_indonesia || "", scope: region.scope, realms_text: region.realms_text || (region as RegionValues & { realms?: string[] }).realms?.join(", ") || "", requirement: region.requirement, image: region.image || "", image_file: undefined, show: region.show }} />;
}
