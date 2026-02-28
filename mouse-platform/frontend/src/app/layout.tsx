import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mouse Platform - AI Employees",
  description: "Deploy and manage AI employees with token-based pricing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
