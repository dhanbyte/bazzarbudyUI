
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css';
import RootContent from './RootContent';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ShopWave — Mobile‑first E‑Commerce',
  description:
    'Flipkart/Amazon‑like frontend with search, filters, wishlist, checkout.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-gray-50" suppressHydrationWarning>
        <RootContent>{children}</RootContent>
      </body>
    </html>
  );
}
