import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, X } from "lucide-react";
import "../quests/quests.css";

type Item = {
  _id: string;
  name_english?: string;
  name_indonesia?: string;
  image?: string;
  price?: number;
  discount?: number;
  effect?: string;
  effect_amount?: number;
  desc_english?: string;
  desc_indonesia?: string;
  shop?: boolean;
};

export default async function Items({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search.slice(0, 100) : "";
  const shop =
    params.shop === "true" || params.shop === "false" ? params.shop : "";
  const page = Math.floor(
    Math.max(1, Math.min(100000, Number(params.page) || 1)),
  );
  const query = new URLSearchParams({
    page: String(page),
    ...(search ? { search } : {}),
    ...(shop ? { shop } : {}),
  });
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  let result: { data: Item[]; total: number } | null = null;
  let unauthorized = false;
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/items?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    unauthorized = response.status === 401;
    if (response.ok) result = await response.json();
  } catch {}
  if (unauthorized) redirect("/login");
  const pageLink = (next: number) => {
    const q = new URLSearchParams(query);
    q.set("page", String(next));
    return `/admin/items?${q}`;
  };
  return (
    <section>
      <p className="eyebrow">WORLD MANAGEMENT</p>
      <div className="list-heading">
        <div>
          <h1>Items</h1>
          <p className="muted">
            Browse items, prices, effects, and shop availability.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/items/new">
            <Plus />
            Add item
          </Link>
        </Button>
      </div>
      {params.created === "1" && <p role="status">Item saved successfully.</p>}
      {params.updated === "1" && (
        <p role="status">Item updated successfully.</p>
      )}
      <form className="quest-filters">
        <input
          name="search"
          aria-label="Search item name"
          placeholder="Search item name…"
          defaultValue={search}
        />
        <select
          name="shop"
          aria-label="Shop availability"
          defaultValue={shop}
          style={{
            padding: "10px",
            borderRadius: 6,
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--line)",
          }}
        >
          <option value="">All items</option>
          <option value="true">In shop</option>
          <option value="false">Not in shop</option>
        </select>
        <Button type="submit" variant="outline">
          <Search />
          Search
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/admin/items">
            <X />
            Reset
          </Link>
        </Button>
      </form>
      {!result ? (
        <p role="alert" className="error">
          Unable to load items. Check the backend connection and refresh.
        </p>
      ) : (
        <div className="quest-table-wrap">
          <div className="quest-table-scroll">
            <table className="quest-table">
              <caption className="quest-caption">{result.total} items</caption>
              <thead>
                <tr>
                  {[
                    "No",
                    "Item ID",
                    "Name",
                    "Image",
                    "Price",
                    "Discount",
                    "Effect",
                    "Amount",
                    "Description",
                    "Shop",
                    "Action",
                  ].map((name) => (
                    <th key={name} scope="col">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="quest-empty">
                      {search || shop
                        ? "No items match your filters."
                        : "No items yet. Item data has not been imported."}
                    </td>
                  </tr>
                ) : (
                  result.data.map((item, index) => (
                    <tr key={item._id}>
                      <td>{(page - 1) * 20 + index + 1}</td>
                      <td>{item._id}</td>
                      <td className="quest-name">
                        <strong>
                          {item.name_english || item.name_indonesia || "—"}
                        </strong>
                        {item.name_english && item.name_indonesia && (
                          <small>{item.name_indonesia}</small>
                        )}
                      </td>
                      <td>{item.image || "—"}</td>
                      <td>{item.price ?? "—"}</td>
                      <td>{item.discount ?? "—"}</td>
                      <td>{item.effect || "—"}</td>
                      <td>{item.effect_amount ?? "—"}</td>
                      <td className="quest-name">
                        {item.desc_english || item.desc_indonesia || "—"}
                      </td>
                      <td>{item.shop ? "Yes" : "No"}</td>
                      <td>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/items/${item._id}/edit`}>
                            <Pencil />
                            Edit
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <footer className="quest-pagination">
            <span>
              Page {page} · {result.total} results
            </span>
            <div>
              {page > 1 && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={pageLink(page - 1)}>
                    <ChevronLeft />
                    Previous
                  </Link>
                </Button>
              )}
              {page * 20 < result.total && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={pageLink(page + 1)}>
                    Next
                    <ChevronRight />
                  </Link>
                </Button>
              )}
            </div>
          </footer>
        </div>
      )}
    </section>
  );
}
