import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ShareButton from "@/components/ShareButton";
import { issues, ogImageOf } from "@/data/issues";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 分享預覽圖需要完整網址：Vercel 上用正式網域，本機開發用 localhost
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3001";

const description = "富聯商務月刊發佈區，每月更新一期，線上翻閱最新商務動態。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "富聯商務月刊",
  description,
  // 首頁分享時用最新一期的封面
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "富聯商務月刊",
    title: "富聯商務月刊",
    description,
    images: [{ url: ogImageOf(issues[0]), width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ShareButton />
      </body>
    </html>
  );
}
