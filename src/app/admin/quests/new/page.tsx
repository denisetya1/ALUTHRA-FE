import ContentForm, { emptyContent } from "@/app/admin/quests/components/content-form";
export default function NewArc() { return <ContentForm level="arc" mode="add" endpoint="/api/admin/quests/arcs" back="/admin/quests" initialValues={emptyContent}/>; }
