import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotivAI Admin Panel",
  description:
    "MotivAI Fitness Application Admin Panel - Kullanıcı ve Spor Salonu Yönetimi",
  keywords: ["MotivAI", "Admin Panel", "Fitness", "Spor Salonu", "Yönetim"],
  authors: [{ name: "MotivAI Team" }],
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
