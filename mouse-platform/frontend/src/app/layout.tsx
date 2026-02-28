import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Mouse Platform - AI-Powered Business Intelligence',
  description: 'Deploy AI employees and manage your business with intelligent automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
