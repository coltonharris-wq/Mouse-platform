import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mouse Platform — AI Workforce Operating System",
  description: "Deploy AI Employees that operate your existing software. No integrations. No dev team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-mouse-offwhite text-mouse-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}
