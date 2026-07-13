import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/sections.css";
import "@/styles/search-validation.css";
import "@/styles/review-generation.css";
import "@/styles/ai-assistant.css";
import "@/styles/dashboard.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blueprint Builder — Project Builder Platform",
  description:
    "Create complete project blueprints through a guided visual workflow. Select technologies, features, and integrations to generate implementation-ready documentation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
