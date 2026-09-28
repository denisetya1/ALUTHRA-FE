import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const names = ['Quests', 'Cards', 'Items', 'Relics', 'Events', 'News', 'Players', 'Realms', 'Rarity', 'Item Effects', 'Card Skills'];
export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const name = names.find(name => name.toLowerCase().replaceAll(' ', '-') === section);
  if (!name) notFound();
  return <section><p className="text-xs font-semibold text-muted-foreground">World</p><h1>{name}</h1><p className="text-muted-foreground">Your {name.toLowerCase()} management workspace.</p><Card className="mt-10 text-center"><CardHeader><CardTitle>{name} is coming soon</CardTitle></CardHeader><CardContent className="text-muted-foreground">This module is not available yet. Use the sidebar to return to an active section.</CardContent></Card></section>;
}
