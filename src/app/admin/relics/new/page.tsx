import { loadEffectOptions } from "@/lib/admin-master-data";
import RelicForm from "../relic-form";

export default async function NewRelic() {
  return <RelicForm effects={await loadEffectOptions()} />;
}
