import { loadCardOptions } from "@/lib/admin-master-data";
import CardForm from "../card-form";

export default async function NewCard() {
  const options = await loadCardOptions();
  return <CardForm {...options} />;
}
