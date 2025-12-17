"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";



export default function ArchivePage() {
  const archives = [
    { year: "2025", months: ["11", "10", "09", "08", "07"], count: 12 },
    { year: "2024", months: ["12", "11", "10"], count: 8 },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <header className="mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold mb-4 text-foreground"
          >
            归档
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            查看所有历史文章
          </motion.p>
        </header>

        <div className="space-y-12">
          {archives.map((yearGroup, index) => (
            <motion.section
              key={yearGroup.year}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-foreground">{yearGroup.year}</h2>
                <span className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-muted-foreground">
                  {yearGroup.count} 篇文章
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {yearGroup.months.map((month, mIndex) => (
                  <Link key={month} href={`/archive/${yearGroup.year}-${month}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-6 bg-white dark:bg-neutral-800 rounded-2xl border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{month} 月</h3>
                            <p className="text-xs text-muted-foreground">查看当月文章</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </main>
  );
}
