import { adminFetch } from "@/lib/admin-session";
import { notFound } from "next/navigation";
import ContentForm, { emptyContent, type ContentValues } from "../../../content-form";
export default async function EditChapter({ params }: { params: Promise<{ arcId:string;chapterId:string }> }) { const {arcId,chapterId}=await params; if(!/^[a-f\d]{24}$/i.test(chapterId)) notFound();const response=await adminFetch(`/admin/quests/chapters/${chapterId}`,{cache:"no-store"});if(response.status===404)notFound();const data=await response.json() as Partial<ContentValues>;return <ContentForm level="chapter" mode="edit" endpoint={`/api/admin/quests/chapters/${chapterId}`} back={`/admin/quests/${arcId}`} initialValues={{...emptyContent,...data}}/>;}
