import type { Metadata } from "next";
import { Archivo, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const board = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-board", display: "swap" });
const read = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-read", display: "swap" });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });

export const metadata: Metadata = {
  title: "kartikvyas.in",
  description: "Kartik Vyas's teaching platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${board.variable} ${read.variable} ${code.variable}`}>
      <body>{children}</body>
    </html>
  );
}
