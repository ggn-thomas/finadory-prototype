import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brèves AMF",
  description: "Publications réglementées AMF des 7 derniers jours et brèves vérifiées.",
};

// Root layout: fonts, dark theme and the centered content column.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} ${newsreader.variable} antialiased`}>
      <body className="min-h-screen">
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">{children}</main>
      </body>
    </html>
  );
}
