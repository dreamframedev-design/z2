import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Z2 Terminal // Signal Scan Active",
  description:
    "Z2 — a creative guild building games, spatial sound, film, and consciousness research tools. The Terminal is how you get clearance.",
  metadataBase: new URL("https://z2.dev"),
  openGraph: {
    title: "Z2 Terminal",
    description: "Six cells. One guild. Breach the signal.",
    siteName: "Z2",
  },
  other: {
    "z2-signal": "CARRIER-ACTIVE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-slate-200`}
      >
        {children}
      </body>
    </html>
  );
}
