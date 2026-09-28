import { unstable_rethrow } from "next/navigation";
import { adminFetch } from "@/lib/admin-session";
import "../quests/quests.css";
import "../cards/cards.css";

type Rarity = { _id: string; tier: number; code: string; name: string; is_active: boolean };

export default async function RarityPage() {
  let result: { data: Rarity[]; total: number } | null = null;
  try {
    const response = await adminFetch(`/admin/rarities`, {
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (response.ok) result = await response.json();
  } catch (error) { unstable_rethrow(error); }
  return <section>
    <p className="eyebrow">Reference data</p><div className="list-heading"><div><h1>Rarity</h1><p className="muted">Rarity tiers available for ALUTHRA cards and rewards.</p></div></div>
    {!result ? <p role="alert" className="error">Unable to load rarity data. Check the backend connection and refresh.</p> : <div className="quest-table-wrap"><div className="quest-table-scroll"><table className="quest-table">
      <caption className="quest-caption">{result.total} rarity tiers</caption><thead><tr><th>Tier</th><th>Mongo ID</th><th>Code</th><th>Name</th><th>Status</th></tr></thead>
      <tbody>{result.data.length ? result.data.map((rarity) => <tr key={rarity._id}><td>{rarity.tier}</td><td>{rarity._id}</td><td>{rarity.code}</td><td><span className={`rarity rarity-${rarity.tier}`}>{rarity.name}</span></td><td>{rarity.is_active ? "Active" : "Inactive"}</td></tr>) : <tr><td colSpan={5} className="quest-empty">No rarity tiers are available. Refresh after the backend seed completes.</td></tr>}</tbody>
    </table></div></div>}
  </section>;
}
