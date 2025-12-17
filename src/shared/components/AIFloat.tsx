"use client";
import { useEffect, useRef, useState } from "react";

export default function AIFloat() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const scrollTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setHidden(true);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => setHidden(false), 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`fixed bottom-6 right-20 z-40 transition-opacity ${hidden ? "opacity-0" : "opacity-100"}`}>
      <button
        className="rounded-full w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        onClick={() => setOpen((v) => !v)}
        aria-label="AI"
      >
        🤖
      </button>
      {open && (
        <div className="mt-3 w-80 max-w-[70vw] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl p-3">
          <div className="text-sm mb-2">AI 助手（示例）</div>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入问题"
              className="flex-1 bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-md px-2 py-1 outline-none"
            />
            <button className="rounded-md px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">发送</button>
          </div>
          <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">登录后将保存历史，后续接入词库/云端模式</div>
        </div>
      )}
    </div>
  );
}
