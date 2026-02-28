import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="dark">
      <body className="bg-dark-bg text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
