import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// Ladda Inter-fonten
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multi-Blog - Dela dina tankar",
  description: "En modern plattform för att dela och upptäcka inlägg från andra användare.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
