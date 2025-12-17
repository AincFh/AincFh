"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AvatarMenu from "./AvatarMenu";


interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user";
}

interface NavBarProps {
  onSearch: (query: string) => void;
  user: User | null;
  onOpenLogin: () => void;
  onOpenAI?: () => void;
}

export default function NavBar({ onSearch, user, onOpenLogin, onOpenAI }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchFormRef = useRef<HTMLFormElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery("");
    }
  };

  // 处理点击外部关闭搜索框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchExpanded &&
        searchFormRef.current &&
        !searchFormRef.current.contains(event.target as Node)
      ) {
        setSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchExpanded]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b-0 transition-all duration-300">
      <nav className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-semibold text-xl tracking-tight transition-colors hover:opacity-80 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.472V5.258a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
            </div>
            <span>Blog</span>
          </Link>
          <ul className="hidden md:flex items-center gap-1 text-[15px] font-medium text-muted-foreground">
            <li><Link href="/posts" className="px-4 py-2 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground">文章</Link></li>
            <li><Link href="/categories" className="px-4 py-2 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground">分类</Link></li>
            <li><Link href="/tags" className="px-4 py-2 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground">标签</Link></li>
            <li><Link href="/archive" className="px-4 py-2 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground">归档</Link></li>
            <li><Link href="/about" className="px-4 py-2 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground">关于</Link></li>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center">
            <form
              ref={searchFormRef}
              onSubmit={handleSearch}
              className={`relative flex items-center transition-all duration-500 ease-apple ${searchExpanded ? "w-64" : "w-10"} overflow-hidden`}
            >
              <div className={`absolute inset-y-0 left-0 flex items-center justify-center w-10 h-10 z-10`}>
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => {
                    setSearchExpanded(true);
                    if (searchQuery.trim()) {
                      onSearch(searchQuery.trim());
                    }
                  }}
                  className="rounded-full w-8 h-8 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e);
                  }
                }}
                onFocus={() => setSearchExpanded(true)}
                placeholder="搜索..."
                className={`bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-md outline-none pl-10 pr-4 py-2 rounded-full text-sm ${searchExpanded ? "w-full opacity-100" : "w-10 opacity-0"} transition-all duration-300 placeholder:text-muted-foreground/70`}
              />
            </form>
          </div>

          <div className="hidden md:block w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-2"></div>


          <li>
            {user ? (
              <AvatarMenu user={user} onOpenLogin={onOpenLogin} onOpenAI={onOpenAI} />
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-5 py-2 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                aria-label="登录"
              >
                登录
              </button>
            )}
          </li>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button aria-label="Toggle menu" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" onClick={() => setOpen(!open)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </nav>
      {open && (
        <div className="md:hidden border-t border-neutral-200/40 dark:border-neutral-800/60">
          <ul className="px-4 py-3 flex flex-col gap-3">
            <li><Link href="/posts" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">文章</Link></li>
            <li><Link href="/categories" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">分类</Link></li>
            <li><Link href="/tags" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">标签</Link></li>
            <li><Link href="/archive" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">归档</Link></li>
            <li><Link href="/about" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">关于</Link></li>
            <li>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文章、标签..."
                  className="flex-1 bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 outline-none"
                />
                <button type="submit" className="rounded-md px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors">搜索</button>
              </form>
            </li>
            <li>
              {user ? (
                <AvatarMenu user={user} isMobile onOpenLogin={onOpenLogin} onOpenAI={onOpenAI} />
              ) : (
                <button
                  onClick={() => { onOpenLogin(); setOpen(false); }}
                  className="group relative w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 transform hover:scale-110"
                  aria-label="用户账户"
                >
                  <img
                    src="https://picsum.photos/seed/default-avatar/200/200.jpg"
                    alt="用户头像"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
