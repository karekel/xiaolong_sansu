import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'たしひきざん れんしゅう',
  description: 'しょうがく1年生向け 2けたのたしひきざん学習アプリ',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
