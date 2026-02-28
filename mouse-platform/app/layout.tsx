export const metadata = {
  title: 'Mouse Platform - AI Agent Management',
  description: 'Manage AI employees, sales, and resellers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
