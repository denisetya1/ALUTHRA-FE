import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import ThemeToggle from './theme-toggle';
import ToastProvider from './toast-provider';
import QueryProvider from '@/providers/query-provider';

const outfit = localFont({
  src: [
    { path: './fonts/outfit-400.ttf', weight: '400', style: 'normal' },
    { path: './fonts/outfit-500.ttf', weight: '500', style: 'normal' },
    { path: './fonts/outfit-600.ttf', weight: '600', style: 'normal' },
    { path: './fonts/outfit-700.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-outfit',
  display: 'swap',
});
export const metadata: Metadata = { title: 'ALUTHRA · Admin', description: 'ALUTHRA administration portal' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={outfit.variable} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('aluthra-theme')==='dark'?'dark':'light';document.documentElement.dataset.sidebar=localStorage.getItem('aluthra-sidebar')==='collapsed'?'collapsed':'expanded'}catch{}" }}/></head><body><QueryProvider><ThemeToggle /><ToastProvider />{children}</QueryProvider></body></html>;
}
