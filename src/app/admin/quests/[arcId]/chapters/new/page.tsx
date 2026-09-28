import ContentForm, { emptyContent } from "../../../content-form";
export default async function NewChapter({ params }: { params: Promise<{ arcId: string }> }) { const { arcId }=await params; return <ContentForm level="chapter" mode="add" endpoint={`/api/admin/quests/arcs/${arcId}/chapters`} back={`/admin/quests/${arcId}`} initialValues={emptyContent}/>; }
