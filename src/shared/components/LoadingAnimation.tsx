"use client";
import { useEffect, useState } from "react";

export default function LoadingAnimation({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟页面加载时间
    const timer = setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-neutral-950">
      <div className="relative flex flex-col items-center">
        {/* 加载动画 */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 dark:border-r-purple-600 rounded-full animate-spin"
               style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
        </div>

        {/* 加载文字 */}
        <div className="mt-8 text-center">
          <div className="text-lg font-medium text-neutral-800 dark:text-neutral-200 animate-pulse">
            加载中...
          </div>
          <div className="mt-2 w-48 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"
                 style={{ width: "70%", animation: "loading 1.5s ease-in-out infinite" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}