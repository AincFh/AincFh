"use client";

import ArticleListWithPreload from "@/frontend/components/ArticleListWithPreload";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/Button";
import { ArrowRight, Code, Palette, BookOpen } from "lucide-react";

export default function Home() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const headlines = ["欢迎来到我的博客", "探索技术与创意", "记录成长与灵感"];

  useEffect(() => {
    const t = setInterval(() => setHeadlineIndex((i) => (i + 1) % headlines.length), 3000);
    return () => clearInterval(t);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] }
  };

  return (
    <main className="min-h-screen pb-32">
      {/* Hero Section - 极致简约 & 巨大排版 */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* 动态背景 - 更柔和、更深邃 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[150px] animate-blob mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute top-[10%] right-[-10%] w-[70%] h-[70%] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[150px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-[150px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-40 h-40 mx-auto rounded-full overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
          >
            <Image
              src="https://picsum.photos/seed/avatar/200/200.jpg"
              alt="Avatar"
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="space-y-8">
            <div className="h-32 md:h-48 flex items-center justify-center overflow-hidden">
              <motion.h1
                key={headlineIndex}
                initial={{ opacity: 0, y: 60, filter: "blur(20px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -60, filter: "blur(20px)" }}
                transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter text-balance text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 dark:from-white dark:to-white/70"
              >
                {headlines[headlineIndex]}
              </motion.h1>
            </div>

            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.3, duration: 1.2 }}
              className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light tracking-tight"
            >
              在这里，我分享关于前端开发、UI 设计以及生活感悟的点滴。
              <br className="hidden md:block" />
              希望这些内容能给你带来启发。
            </motion.p>
          </div>

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.5, duration: 1.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
          >
            <Link href="/posts">
              <Button size="lg" className="rounded-full px-12 py-7 text-xl shadow-apple-md hover:shadow-apple-hover transition-all duration-500 hover:scale-105 active:scale-95" rightIcon={<ArrowRight className="w-6 h-6" />}>
                开始阅读
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="glass" size="lg" className="rounded-full px-12 py-7 text-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-500 hover:scale-105 active:scale-95">
                关于我
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator - Minimal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.div>
      </section>

      {/* Features Grid - Apple Style Cards - Large Spacing */}
      <section className="container mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {[
            {
              icon: <Code className="w-10 h-10 text-blue-500" />,
              title: "技术深度",
              desc: "深入探讨 React, Next.js 等前沿技术栈的最佳实践。",
              bg: "bg-blue-50 dark:bg-blue-500/10"
            },
            {
              icon: <Palette className="w-10 h-10 text-purple-500" />,
              title: "设计美学",
              desc: "追求极致的用户体验，分享 UI/UX 设计心得。",
              bg: "bg-purple-50 dark:bg-purple-500/10"
            },
            {
              icon: <BookOpen className="w-10 h-10 text-green-500" />,
              title: "持续学习",
              desc: "记录学习过程中的思考，构建完整的知识体系。",
              bg: "bg-green-50 dark:bg-green-500/10"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-12 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 shadow-apple-md hover:shadow-apple-hover transition-all duration-500"
            >
              <div className={`w-20 h-20 rounded-3xl ${feature.bg} flex items-center justify-center mb-10`}>
                {feature.icon}
              </div>
              <h3 className="text-3xl font-display font-bold mb-5 text-foreground tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-body">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Latest Posts - Clean & Spacious */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-20">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-foreground tracking-tighter">最新文章</h2>
            <p className="text-xl text-muted-foreground font-light">探索最新的技术动态与思考</p>
          </div>
          <Link href="/posts" className="hidden md:block">
            <Button variant="ghost" className="text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full px-8 py-6" rightIcon={<ArrowRight className="w-5 h-5" />}>
              查看全部
            </Button>
          </Link>
        </div>
        <ArticleListWithPreload />

        <div className="mt-12 md:hidden flex justify-center">
          <Link href="/posts">
            <Button variant="ghost" className="text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full px-8 py-6" rightIcon={<ArrowRight className="w-5 h-5" />}>
              查看全部
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
