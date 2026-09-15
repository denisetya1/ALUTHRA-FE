import { notFound } from 'next/navigation';
const names = ['Quests', 'Cards', 'Items', 'Relics', 'Events', 'News', 'Players', 'Realms', 'Rarity', 'Item Effects', 'Card Skills'];
export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const name = names.find(name => name.toLowerCase().replaceAll(' ', '-') === section);
  if (!name) notFound();
  return <section><p className="eyebrow">WORLD MANAGEMENT</p><h1>{name}</h1><p className="muted">Your {name.toLowerCase()} management workspace.</p><div className="empty-panel"><span aria-hidden="true">✧</span><h2>{name} workspace</h2><p>This module is not available yet.</p></div></section>;
}
