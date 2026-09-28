import { unstable_rethrow } from "next/navigation";
import { adminFetch } from "@/lib/admin-session";
import "../quests/quests.css";
import "./realms.css";

type Realm = {
  _id: string;
  code: string;
  name: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default async function RealmsPage() {

  let result: { data: Realm[]; total: number } | null = null;
  try {
    const response = await adminFetch(
      `/admin/realms`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    if (response.ok) result = await response.json();
  } catch (error) { unstable_rethrow(error); }

  return (
    <section>
      <p className="eyebrow">Reference data</p>
      <div className="list-heading">
        <div>
          <h1>Realms</h1>
          <p className="muted">The three realms available throughout ALUTHRA.</p>
        </div>
      </div>
      {!result ? (
        <p role="alert" className="error">Unable to load realms. Check the backend connection and refresh.</p>
      ) : (
        <div className="quest-table-wrap">
          <div className="quest-table-scroll">
            <table className="quest-table">
              <caption className="quest-caption">{result.total} realms</caption>
              <thead><tr><th>No</th><th>Mongo ID</th><th>Code</th><th>Name</th><th>Status</th></tr></thead>
              <tbody>
                {result.data.length ? result.data.map((realm, index) => (
                  <tr key={realm._id}>
                    <td>{index + 1}</td>
                    <td>{realm._id}</td>
                    <td>{realm.code}</td>
                    <td className="quest-name"><strong>{realm.name}</strong></td>
                    <td><span className="realm-status">{realm.is_active ? "Active" : "Inactive"}</span></td>
                  </tr>
                )) : <tr><td colSpan={5} className="quest-empty">No realms are available. Refresh after the backend seed completes.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
