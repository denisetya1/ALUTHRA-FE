import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./quests.css";
import "./region.css";

type Region = {
  _id: string;
  id: number;
  region_name: string;
  show: boolean;
  quest_count: number;
};

export default async function QuestRegions() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) redirect("/login");
  let result: { data: Region[]; total: number } | null = null;
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL || "http://127.0.0.1:3000/api/v1"}/admin/quests/regions`,
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
      <p className="eyebrow">WORLD MANAGEMENT</p>
      <h1>Quest regions</h1>
      <p className="muted">
        Choose a region to view and manage its quest list.
      </p>
      {!result ? (
        <p role="alert" className="error">
          Unable to load quest regions.
        </p>
      ) : (
        <div className="quest-table-wrap region-table-wrap">
          <div className="quest-table-scroll">
            <table className="quest-table">
              <caption className="quest-caption">
                {result.total} regions
              </caption>
              <thead>
                <tr>
                  <th>Region ID</th>
                  <th>Region</th>
                  <th>Visibility</th>
                  <th>Quests</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((region) => (
                  <tr key={region._id}>
                    <td>{region.id}</td>
                    <td className="quest-name">
                      <strong>{region.region_name}</strong>
                    </td>
                    <td>
                      <span className={region.show ? "region-visible" : "region-hidden"}>
                        {region.show ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td>{region.quest_count}</td>
                    <td>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/quests/${region.id}`}>
                          View quests <ArrowRight />
                        </Link>
                      </Button>
                    </td>
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
