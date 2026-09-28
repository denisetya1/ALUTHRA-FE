import { unstable_rethrow } from "next/navigation";
import { adminFetch } from "@/lib/admin-session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import "../quests/quests.css";
import "./relics.css";
type Relic = {
  _id: string;
  name_english: string;
  name_indonesia?: string;
  image?: string;
  effect: string;
  effect_amount: number;
  price: number;
  discount: number;
  desc_english?: string;
  shop: boolean;
};
export default async function Relics({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search.slice(0, 100) : "";
  const page = Math.floor(Math.max(1, Number(params.page) || 1));
  const query = new URLSearchParams({
    page: String(page),
    ...(search ? { search } : {}),
  });
  let result: { data: Relic[]; total: number } | null = null;
  try {
    const response = await adminFetch(
      `/admin/relics?${query}`,
      { cache: "no-store" },
    );
    if (response.ok) result = await response.json();
  } catch (error) { unstable_rethrow(error); }
  return (
    <section>
      <p className="eyebrow">World</p>
      <div className="list-heading">
        <div>
          <h1>Relics</h1>
          <p className="muted">
            Manage relic powers, prices, and shop availability.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/relics/new">
            <Plus />
            Add relic
          </Link>
        </Button>
      </div>
      <form className="quest-filters">
        <input
          name="search"
          placeholder="Search relic name…"
          defaultValue={search}
        />
        <Button variant="outline">Search</Button>
        {search && (
          <Button variant="ghost" asChild>
            <Link href="/admin/relics">Reset</Link>
          </Button>
        )}
      </form>
      {!result ? (
        <p className="error">Unable to load relics.</p>
      ) : (
        <div className="quest-table-wrap">
          <div className="quest-table-scroll">
            <table className="quest-table">
              <caption className="quest-caption">{result.total} relics</caption>
              <thead>
                <tr>
                  {[
                    "Mongo ID",
                    "Name",
                    "Image",
                    "Effect",
                    "Amount",
                    "Price",
                    "Discount",
                    "Description",
                    "Shop",
                    "Action",
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.length ? (
                  result.data.map((r) => (
                    <tr key={r._id}>
                      <td>{r._id}</td>
                      <td className="quest-name">
                        <strong>{r.name_english}</strong>
                        {r.name_indonesia && <small>{r.name_indonesia}</small>}
                      </td>
                      <td>{r.image || "None"}</td>
                      <td>{r.effect}</td>
                      <td>{r.effect_amount}</td>
                      <td>{r.price}</td>
                      <td>{r.discount}</td>
                      <td className="quest-name">{r.desc_english || "Not set"}</td>
                      <td>{r.shop ? "Yes" : "No"}</td>
                      <td>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/relics/${r._id}/edit`}>
                            <Pencil />
                            Edit
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="quest-empty">
                      No relics yet. Use Add relic to create the first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
