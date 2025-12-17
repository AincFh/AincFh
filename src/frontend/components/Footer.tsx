"use client";

"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black">
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Section */}
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">Cloudflare Blog</span>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-sm text-[15px]">
              探索技术与创意的边界。
              <br />
              构建简洁、快速、安全的数字体验。
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="font-semibold mb-6 text-foreground text-sm uppercase tracking-wider">导航</h4>
            <ul className="space-y-4 text-[15px] text-muted-foreground">
              <li><Link href="/posts" className="hover:text-foreground transition-colors">文章</Link></li>
              <li><Link href="/tags" className="hover:text-foreground transition-colors">标签</Link></li>
              <li><Link href="/categories" className="hover:text-foreground transition-colors">分类</Link></li>
              <li><Link href="/archive" className="hover:text-foreground transition-colors">归档</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold mb-6 text-foreground text-sm uppercase tracking-wider">关于</h4>
            <ul className="space-y-4 text-[15px] text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">关于我</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
              <li><Link href="/rss.xml" className="hover:text-foreground transition-colors">RSS 订阅</Link></li>
            </ul>
          </div>

          {/* Subscription Section */}
          <div className="md:col-span-3">
            <h4 className="font-semibold mb-6 text-foreground text-sm uppercase tracking-wider">订阅更新</h4>
            <p className="text-[15px] text-muted-foreground mb-4">
              获取最新的文章和技术分享，直接发送到您的邮箱。
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="您的邮箱地址"
                className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
              />
              <Button className="w-full rounded-lg" variant="default">
                订阅
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-20 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Cloudflare Blog. All rights reserved.
            </span>
            <div className="flex items-center gap-8 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                隐私政策
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                服务条款
              </Link>
              <Link href="/sitemap.xml" className="text-muted-foreground hover:text-foreground transition-colors">
                站点地图
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}