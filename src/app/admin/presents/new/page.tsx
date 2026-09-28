import { loadPresentOptions } from "@/lib/admin-master-data";
import PresentForm from "../present-form";

export default async function NewPresent() {
  return <PresentForm {...await loadPresentOptions()} />;
}
