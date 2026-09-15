import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");

  let result: { data: Realm[]; total: number } | null = null;
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/realms`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    if (response.status === 401) redirect("/login");
    if (response.ok) result = await response.json();
  } catch {}

  return (
    <section>
      <p className="eyebrow">MASTER DATA</p>
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
                {result.data.map((realm, index) => (
                  <tr key={realm._id}>
                    <td>{index + 1}</td>
                    <td>{realm._id}</td>
                    <td>{realm.code}</td>
                    <td className="quest-name"><strong>{realm.name}</strong></td>
                    <td><span className="realm-status">{realm.is_active ? "Active" : "Inactive"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
