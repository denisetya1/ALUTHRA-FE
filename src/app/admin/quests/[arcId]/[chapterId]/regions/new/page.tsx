import ContentForm, { emptyContent } from "../../../../content-form";
export default async function NewRegion({params}:{params:Promise<{arcId:string;chapterId:string}>}){const{arcId,chapterId}=await params;return <ContentForm level="region" mode="add" endpoint={`/api/admin/quests/chapters/${chapterId}/regions`} back={`/admin/quests/${arcId}/${chapterId}`} initialValues={emptyContent}/>;}
