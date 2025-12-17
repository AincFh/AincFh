import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./responsive.css";
import "./performance.css";
import ClientShell from "./ClientShell";

// Configure Edge Runtime for all routes
export const runtime = 'edge';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "个人博客 | 探索技术与创意",
    template: "%s | 个人博客"
  },
  description: "Cloudflare Pages 动态个人博客，分享前端开发、创意设计和生活随笔。",
  keywords: ["博客", "前端开发", "React", "Next.js", "设计", "生活"],
  authors: [{ name: "您的名字" }],
  creator: "您的名字",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://your-blog-domain.com",
    title: "个人博客 | 探索技术与创意",
    description: "分享前端开发、创意设计和生活随笔。",
    siteName: "个人博客",
    images: [
      {
        url: "https://picsum.photos/seed/og-image/1200/630.jpg",
        width: 1200,
        height: 630,
        alt: "个人博客封面",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "个人博客 | 探索技术与创意",
    description: "分享前端开发、创意设计和生活随笔。",
    images: ["https://picsum.photos/seed/og-image/1200/630.jpg"],
    creator: "@yourtwitterhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="min-h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen pb-20`}>
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
