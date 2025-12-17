"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScrollReveal from "@/shared/components/ScrollReveal";

export default function NotFound() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 flex flex-col items-center justify-center text-center px-4 py-20 relative">
      {/* 动态背景元素 - 与主页风格一致 */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-72 h-72 bg-blue-200/30 dark:bg-blue-800/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"
          style={{
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`,
          }}
        ></div>
        <div
          className="absolute top-0 right-0 w-72 h-72 bg-purple-200/30 dark:bg-purple-800/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"
          style={{
            right: `${mousePosition.x * -0.02}px`,
            bottom: `${mousePosition.y * -0.02}px`,
          }}
        ></div>
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-pink-200/30 dark:bg-pink-800/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"
          style={{
            left: `${mousePosition.x * -0.01}px`,
            top: `${mousePosition.y * 0.01}px`,
          }}
        ></div>
      </div>

      {/* 装饰性几何图形 - 与主页风格一致 */}
      <div className="absolute top-10 right-10 w-20 h-20 border-4 border-blue-200/30 dark:border-blue-800/20 rounded-lg transform rotate-45 animate-float"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 border-4 border-purple-200/30 dark:border-purple-800/20 rounded-full animate-float animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-pink-100/30 dark:bg-pink-800/20 rounded-lg transform rotate-12 animate-float animation-delay-4000"></div>

      {/* 主要内容 */}
      <div className="relative z-10 max-w-4xl w-full">
        <ScrollReveal delay={100}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-16 border border-white/30 dark:border-gray-700/30">
            {/* 404 错误代码 */}
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                404
              </h1>
            </div>

            {/* 错误信息 */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                页面未找到
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                抱歉，您访问的页面似乎不存在。可能是链接错误、页面已被移除或您输入了错误的地址。
              </p>
            </div>

            {/* 导航按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/"
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 px-8 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <span className="relative z-10">返回首页</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-purple-600 to-pink-500 transition-transform duration-300 group-hover:translate-x-0"></div>
              </Link>
              <Link
                href="/posts"
                className="group relative overflow-hidden rounded-full border border-gray-300 dark:border-gray-600 px-8 py-3 font-medium text-gray-700 dark:text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                浏览文章
              </Link>
            </div>

            {/* 搜索建议 */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 <strong>提示：</strong>您可以尝试使用搜索功能查找您感兴趣的内容，或者访问我们的
                <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">文章分类</Link>
                页面浏览更多内容。
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* 浮动元素 - 与主页风格一致 */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400 rounded-full animate-bounce animation-delay-500"></div>
      <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400 rounded-full animate-bounce animation-delay-1000"></div>
      <div className="absolute bottom-32 left-40 w-5 h-5 bg-pink-400 rounded-full animate-bounce animation-delay-1500"></div>
      <div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-300 rounded-full animate-bounce animation-delay-2000"></div>
    </div>
  );
}