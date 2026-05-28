import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StorageProvider } from '@/context/StorageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Progesme - Project & Task Manager',
  description: 'Manage your projects and activities with a fast, clean, and flexible mobile-first app.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Progesme',
  },
};

export const viewport = {
  themeColor: '#080810',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-bg text-text1 selection:bg-accent/30 selection:text-accent`}>
        <StorageProvider>
          <ThemeProvider>
            {/* Scroll root — this scrolls, body stays fixed */}
            <div id="app-scroll-root">
              <main className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-bg">
                {children}
              </main>
            </div>
            {/* Nav is outside the scroll container so it never moves */}
            <Navigation />
          </ThemeProvider>
        </StorageProvider>
      </body>
    </html>
  );
}
