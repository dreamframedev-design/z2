import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif, Space_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Z2 — A Creative Guild",
  description:
    "Z2 builds games, spatial sound, film, consciousness research, and experiments that refuse categories. This is the index.",
  metadataBase: new URL("https://z2.dev"),
  openGraph: {
    title: "Z2",
    description: "A creative guild. Games · Sound · Film · Consciousness · Experiments.",
    siteName: "Z2",
  },
  icons: {
    icon: "/icon.svg",
  },
  other: {
    "z2-signal": "RED-ACTIVE",
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
        className={`${bricolage.variable} ${instrument.variable} ${spaceMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
