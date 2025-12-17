"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/shared/components/ui/Button";
import { Github, Twitter, Mail, Code, Coffee, Globe } from "lucide-react";



export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">关于我</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            热爱技术，追求极致的用户体验。
            <br />
            在这里记录我的学习与思考。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-secondary/30 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 border border-border/50"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl flex-shrink-0">
              <Image
                src="https://picsum.photos/seed/avatar/200/200.jpg"
                alt="Avatar"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Cloudflare Blog Author</h2>
              <p className="text-muted-foreground mb-4">全栈开发者 / UI 设计爱好者</p>
              <p className="text-foreground/80 leading-relaxed mb-6">
                专注于构建高性能、高可用的 Web 应用。喜欢探索新技术，热衷于开源社区。
                我相信好的设计不仅仅是好看，更是好用。
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button variant="outline" size="sm" leftIcon={<Github className="w-4 h-4" />}>GitHub</Button>
                <Button variant="outline" size="sm" leftIcon={<Twitter className="w-4 h-4" />}>Twitter</Button>
                <Button variant="outline" size="sm" leftIcon={<Mail className="w-4 h-4" />}>Email</Button>
              </div>
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-500/5 rounded-3xl p-8 border border-blue-500/10 flex flex-col justify-center"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" />
              技术栈
            </h3>
            <div className="flex flex-wrap gap-2">
              {["React", "Next.js", "TypeScript", "Tailwind", "Node.js", "Cloudflare"].map((tech) => (
                <span key={tech} className="px-3 py-1 bg-background rounded-full text-sm font-medium shadow-sm border border-border/50">
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-purple-500/5 rounded-3xl p-8 border border-purple-500/10"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-purple-500" />
              兴趣爱好
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>📸 摄影与后期</li>
              <li>🎵 独立音乐</li>
              <li>🎮 独立游戏</li>
              <li>📚 阅读与写作</li>
            </ul>
          </motion.div>

          {/* Location/Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 bg-green-500/5 rounded-3xl p-8 border border-green-500/10 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                当前状态
              </h3>
              <p className="text-muted-foreground">正在寻找新的机会，欢迎联系！</p>
            </div>
            <div className="hidden md:block">
              <Button>联系我</Button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
