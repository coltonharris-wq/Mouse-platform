import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mouse Platform - AI Employee Management',
  description: 'Deploy AI employees that work 24/7. Manage sales, resellers, and customers from a unified platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  )
}
