import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "../quests/quests.css";
import "../cards/cards.css";

type Rarity = { _id: string; tier: number; code: string; name: string; is_active: boolean };

export default async function RarityPage() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  let result: { data: Rarity[]; total: number } | null = null;
  try {
    const response = await fetch(`${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/rarities`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (response.status === 401) redirect("/login");
    if (response.ok) result = await response.json();
  } catch {}
  return <section>
    <p className="eyebrow">MASTER DATA</p><div className="list-heading"><div><h1>Rarity</h1><p className="muted">Rarity tiers available for ALUTHRA cards and rewards.</p></div></div>
    {!result ? <p role="alert" className="error">Unable to load rarity data. Check the backend connection and refresh.</p> : <div className="quest-table-wrap"><div className="quest-table-scroll"><table className="quest-table">
      <caption className="quest-caption">{result.total} rarity tiers</caption><thead><tr><th>Tier</th><th>Mongo ID</th><th>Code</th><th>Name</th><th>Status</th></tr></thead>
      <tbody>{result.data.map((rarity) => <tr key={rarity._id}><td>{rarity.tier}</td><td>{rarity._id}</td><td>{rarity.code}</td><td><span className={`rarity rarity-${rarity.tier}`}>{rarity.name}</span></td><td>{rarity.is_active ? "Active" : "Inactive"}</td></tr>)}</tbody>
    </table></div></div>}
  </section>;
}
