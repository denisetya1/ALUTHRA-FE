import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "../quests/quests.css";
import "../realms/realms.css";

type ItemEffect = {
  _id: string;
  legacy_id: number;
  name: string;
  description: string;
  is_active: boolean;
};

export default async function ItemEffectsPage() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  let result: { data: ItemEffect[]; total: number; source: string } | null = null;
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/item-effects`,
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
          <h1>Item Effects</h1>
          <p className="muted">Gameplay item effects imported from the Varhara master data.</p>
        </div>
      </div>
      {!result ? (
        <p role="alert" className="error">Unable to load item effects. Check the backend connection and refresh.</p>
      ) : (
        <div className="quest-table-wrap">
          <div className="quest-table-scroll">
            <table className="quest-table">
              <caption className="quest-caption">{result.total} item effects · Source: {result.source}</caption>
              <thead><tr><th>No</th><th>Mongo ID</th><th>Legacy ID</th><th>Effect key</th><th>Description</th><th>Status</th></tr></thead>
              <tbody>{result.data.map((effect, index) => (
                <tr key={effect._id}>
                  <td>{index + 1}</td><td>{effect._id}</td><td>{effect.legacy_id}</td>
                  <td className="quest-name"><strong>{effect.name}</strong></td>
                  <td>{effect.description}</td>
                  <td><span className="realm-status">{effect.is_active ? "Active" : "Inactive"}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
