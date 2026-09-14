import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import './quests.css';

type Quest = { _id: string; id: number; region_id: number; quest_name: string; quest_desc_english?: string; quest_desc_indonesia?: string; get_exp?: number; get_coin?: { min?: number; max?: number }; stamina_cost?: number; progress?: number; is_final?: boolean; total_drop_item?: number; boss_name?: string; boss_image?: string; boss_hp?: number; boss_valor?: number; boss_fortitude?: number; boss_reward?: { type: string; value: number }[]; pre_boss_dialog_english?: string; post_boss_dialog_english?: string; pre_boss_dialog_indonesia?: string; post_boss_dialog_indonesia?: string };

export default async function Quests({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search.slice(0, 100) : '';
  const region = typeof params.region_id === 'string' && /^[1-9]\d*$/.test(params.region_id) ? params.region_id : '';
  const page = Math.max(1, Math.min(100000, Number(params.page) || 1));
  const query = new URLSearchParams({ page: String(Math.floor(page)), limit: '20', ...(search ? { search } : {}), ...(region ? { region_id: region } : {}) });
  const token = (await cookies()).get('admin_session')?.value;
  if (!token) redirect('/login');
  let result: { data: Quest[]; total: number } | null = null;
  let unauthorized = false;
  try {
    const response = await fetch(`${process.env.API_BASE_URL || 'http://127.0.0.1:3000/api/v1'}/admin/quests?${query}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    unauthorized = response.status === 401;
    if (response.ok) result = await response.json();
  } catch {}
  if (unauthorized) redirect('/login');
  const pageLink = (next: number) => { const q = new URLSearchParams(query); q.set('page', String(next)); return `/admin/quests?${q}`; };
  return <section><p className="eyebrow">WORLD MANAGEMENT</p><h1>Quests</h1><p className="muted">Browse quest objectives, rewards, and final encounters.</p>
    <form className="quest-filters"><input name="search" aria-label="Search quest name" placeholder="Search quest name…" defaultValue={search}/><input name="region_id" aria-label="Region ID" type="number" min="1" placeholder="Region ID" defaultValue={region}/><button className="secondary">Search</button><Link href="/admin/quests">Reset</Link></form>
    {!result ? <p role="alert" className="error">Unable to load quests. Check the backend connection and refresh.</p> : <div className="quest-table-wrap"><div className="quest-table-scroll"><table className="quest-table"><caption className="quest-caption">{result.total} quests</caption><thead><tr>{['ID', 'Region ID', 'Quest', 'EXP', 'Coin (min–max)', 'Stamina', 'Progress', 'Final', 'Drop items', 'Boss details'].map(name => <th key={name} scope="col">{name}</th>)}</tr></thead><tbody>{result.data.length === 0 ? <tr><td colSpan={10} className="quest-empty">{search || region ? 'No quests match your filters.' : 'No quests yet. Quest data has not been imported.'}</td></tr> : result.data.map(q => <tr key={q._id}><td>{q.id}</td><td>{q.region_id}</td><td className="quest-name"><strong>{q.quest_name}</strong><small>{q.quest_desc_english}</small>{q.quest_desc_indonesia && <small>{q.quest_desc_indonesia}</small>}</td><td>{q.get_exp ?? '—'}</td><td>{q.get_coin?.min ?? '—'}–{q.get_coin?.max ?? '—'}</td><td>{q.stamina_cost ?? '—'}</td><td>{q.progress ?? '—'}</td><td>{q.is_final ? 'Yes' : 'No'}</td><td>{q.total_drop_item ?? '—'}</td><td>{q.is_final ? <details><summary>{q.boss_name || 'Boss'}</summary><dl>{Object.entries({ HP: q.boss_hp, Valor: q.boss_valor, Fortitude: q.boss_fortitude, Image: q.boss_image, 'Rewards': q.boss_reward?.map(r => `${r.type}: ${r.value}`).join(', '), 'Pre-dialog EN': q.pre_boss_dialog_english, 'Post-dialog EN': q.post_boss_dialog_english, 'Pre-dialog ID': q.pre_boss_dialog_indonesia, 'Post-dialog ID': q.post_boss_dialog_indonesia }).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value ?? '—'}</dd></div>)}</dl></details> : '—'}</td></tr>)}</tbody></table></div><footer className="quest-pagination"><span>Page {Math.floor(page)} · {result.total} results</span><div>{page > 1 && <Link href={pageLink(page - 1)}>← Previous</Link>}{page * 20 < result.total && <Link href={pageLink(page + 1)}>Next →</Link>}</div></footer></div>}
  </section>;
}
