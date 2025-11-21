import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnowMate - Canadian Winter Assistant",
  description: "Your mobile-first winter weather companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

