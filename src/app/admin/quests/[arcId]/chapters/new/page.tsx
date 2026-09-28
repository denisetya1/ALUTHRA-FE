import ContentForm, { emptyContent } from "@/app/admin/quests/components/content-form";
export default async function NewChapter({ params }: { params: Promise<{ arcId: string }> }) { const { arcId }=await params; return <ContentForm level="chapter" mode="add" endpoint={`/api/admin/quests/arcs/${arcId}/chapters`} back={`/admin/quests/${arcId}`} initialValues={emptyContent}/>; }
