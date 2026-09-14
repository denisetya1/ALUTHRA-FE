import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import './theme.css';
import './shadcn.css';
import ThemeToggle from './theme-toggle';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
export const metadata: Metadata = { title: 'ALUTHRA · Admin', description: 'ALUTHRA administration portal' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={outfit.variable} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('aluthra-theme')==='dark'?'dark':'light';document.documentElement.dataset.sidebar=localStorage.getItem('aluthra-sidebar')==='collapsed'?'collapsed':'expanded'}catch{}" }}/></head><body><ThemeToggle />{children}</body></html>;
}
