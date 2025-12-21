import type { Metadata, Viewport } from "next";
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
  title: "巨戟アーティア厳選マネージャー | Kyogeki Artian Optimizer",
  description:
    "モンスターハンターワイルズの巨戟アーティア武器厳選を効率化するツール。複数の武器種×属性のテーブル結果を記録し、最短手順で理想個体を入手するための厳選チャートを自動生成します。",
  keywords: [
    "モンスターハンターワイルズ",
    "Monster Hunter Wilds",
    "巨戟アーティア",
    "厳選",
    "最適化",
    "ツール",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
