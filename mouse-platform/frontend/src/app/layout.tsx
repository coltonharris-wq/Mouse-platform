import './globals.css';

export const metadata = {
  title: 'KingMouse — AI Employees for Small Business',
  description: 'Deploy an AI employee that handles operations, scheduling, inventory, and customer communication. Starting at $4.98/hr.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
