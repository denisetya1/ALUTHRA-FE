import ContentForm, { emptyContent } from "../content-form";
export default function NewArc() { return <ContentForm level="arc" mode="add" endpoint="/api/admin/quests/arcs" back="/admin/quests" initialValues={emptyContent}/>; }
