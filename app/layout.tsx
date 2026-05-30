import type { Metadata } from "next";
import { Hanken_Grotesk, Fraunces } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Z2 — Independent Creative Studio",
  description:
    "Z2 is an independent creative studio. Games, sound, film, and instruments for altered perception.",
  metadataBase: new URL("https://z2.dev"),
  openGraph: {
    title: "Z2",
    description: "An independent creative studio. Games · Sound · Film.",
    siteName: "Z2",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${hanken.variable} ${fraunces.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
