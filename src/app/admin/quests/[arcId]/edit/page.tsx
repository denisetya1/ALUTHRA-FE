import { adminFetch } from "@/lib/admin-session";
import { notFound } from "next/navigation";
import ContentForm, { emptyContent, type ContentValues } from "../../content-form";
export default async function EditArc({ params }: { params: Promise<{ arcId: string }> }) { const { arcId } = await params; if (!/^[a-f\d]{24}$/i.test(arcId)) notFound(); const response=await adminFetch(`/admin/quests/arcs/${arcId}`,{cache:"no-store"}); if(response.status===404) notFound(); const data=await response.json() as Partial<ContentValues>; return <ContentForm level="arc" mode="edit" endpoint={`/api/admin/quests/arcs/${arcId}`} back="/admin/quests" initialValues={{...emptyContent,...data}}/>; }
