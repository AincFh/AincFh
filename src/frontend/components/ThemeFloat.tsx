"use client";
import { useEffect, useRef, useState } from "react";

function nowInUTC8() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

export default function ThemeFloat({ onOpenAI }: { onOpenAI?: () => void }) {
  const [hidden, setHidden] = useState(false);
  const scrollTimer = useRef<number | null>(null);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("themeOverride");
    if (saved === "light" || saved === "dark") {
      setIsAutoMode(false);
      applyMode(saved);
    } else {
      setIsAutoMode(true);
      autoApply();
    }

    // 每小时检查一次是否需要自动切换主题
    const t = setInterval(() => {
      if (isAutoMode) autoApply();
    }, 3600000);

    return () => clearInterval(t);
  }, [isAutoMode]);

  useEffect(() => {
    const onScroll = () => {
      setHidden(true);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => setHidden(false), 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const applyMode = (m: "light" | "dark") => {
    setMode(m);
    const el = document.documentElement;
    // 移除所有主题类
    el.classList.remove("light", "dark");
    // 添加当前主题类
    el.classList.add(m);
  };

  const toggle = () => {
    setIsTransitioning(true);
    const next = mode === "dark" ? "light" : "dark";
    localStorage.setItem("themeOverride", next);
    setIsAutoMode(false);

    // 添加缩放动画效果
    setTimeout(() => {
      applyMode(next);
    }, 150);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const autoApply = () => {
    const h = nowInUTC8().getHours();
    applyMode(h >= 20 || h < 8 ? "dark" : "light");
  };

  const enableAutoMode = () => {
    localStorage.removeItem("themeOverride");
    setIsAutoMode(true);
    autoApply();
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${hidden ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
      <div className="flex flex-col items-center gap-2 rounded-full px-2 py-2 bg-white/70 dark:bg-neutral-900/70 backdrop-blur border border-neutral-200 dark:border-neutral-700 shadow-lg">


        {onOpenAI && (
          <button
            onClick={onOpenAI}
            aria-label="AI Assistant"
            className="group rounded-full w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 hover:scale-110 shadow-md"
            title="AI助手"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        )}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className={`group rounded-full w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 ${
            isTransitioning ? "scale-125 rotate-180" : "hover:scale-110"
          }`}
          title={mode === "dark" ? "切换到浅色模式" : "切换到深色模式"}
        >
          <div className={`transition-all duration-300 ${isTransitioning ? "opacity-0 scale-50" : "opacity-100 scale-100"}`}>
            {mode === "dark" ? (
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* 添加过渡覆盖层 */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-900 pointer-events-none transition-opacity duration-300"
             style={{ opacity: isTransitioning ? 0.7 : 0 }} />
      )}
    </div>
  );
}
