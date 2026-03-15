import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
    title: { default: 'Shrinkr — Free URL Shortener', template: '%s | Shrinkr' },
    description: 'Shrinkr is a blazing-fast, free URL shortener with real-time analytics. Shorten links in seconds, track clicks, and grow smarter.',
    keywords: ['URL shortener', 'link shortener', 'analytics', 'free URL shortener'],
    authors: [{ name: 'Shrinkr' }],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        title: 'Shrinkr — Free URL Shortener',
        description: 'Blazing-fast, free URL shortener with real-time click analytics.',
        siteName: 'Shrinkr',
    },
    robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="min-h-screen bg-surface-0 text-white antialiased">
                {children}
                <Toaster />
            </body>
        </html>
    );
}
