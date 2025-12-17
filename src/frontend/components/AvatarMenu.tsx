"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user";
}

interface AvatarMenuProps {
  user?: User | null;
  isMobile?: boolean;
  onOpenLogin?: () => void;
  onOpenAI?: () => void;
}

export default function AvatarMenu({ user: propUser, isMobile = false, onOpenLogin, onOpenAI }: AvatarMenuProps) {
  const [user, setUser] = useState<User | null>(propUser || null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 初始化时设置为未登录状态
  useEffect(() => {
    // 检查本地存储是否有用户信息，如果没有则保持未登录状态
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // 不再自动设置测试用户
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    if (!user) {
      // 如果没有登录，触发登录模态框
      if (onOpenLogin) {
        onOpenLogin();
      }
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  // 处理点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // 默认头像
  const defaultAvatar = "https://picsum.photos/seed/default-avatar/100/100.jpg";

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="group rounded-full w-10 h-10 overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-neutral-100 dark:bg-neutral-800 hover:shadow-lg hover:scale-105 transform active:scale-95"
        >
          <Image
            src={user && user.avatar && user.avatar.trim() !== '' ? user.avatar : defaultAvatar}
            alt={user ? user.name : "用户头像"}
            width={40}
            height={40}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // 处理头像加载失败的情况
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar;
            }}
          />
        </button>

        {/* 用户菜单 - iOS Popover Style */}
        {isMenuOpen && user && (
          <div
            ref={menuRef}
            className={`absolute ${isMobile ? "right-auto left-0" : "right-0"} mt-3 z-50 w-64 rounded-2xl glass-card p-2 animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right`}
          >
            <div className="px-4 py-3">
              <div className="font-semibold text-foreground text-[15px]">{user.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                {user.role === "admin" ? "管理员" : "普通用户"}
              </div>
            </div>

            <div className="h-px bg-neutral-200/50 dark:bg-white/5 my-1 mx-2" />

            <ul className="space-y-1">
              <li>
                <button onClick={() => { if (onOpenAI) onOpenAI(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-all duration-200 flex items-center space-x-3 group">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">AI 助手</span>
                </button>
              </li>
              <li>
                <Link href="/profile" className="block px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-all duration-200 flex items-center space-x-3 group">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">修改资料</span>
                </Link>
              </li>
              <li>
                <Link href="/settings" className="block px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-all duration-200 flex items-center space-x-3 group">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">设置</span>
                </Link>
              </li>
              {user.role === "admin" && (
                <li>
                  <Link href="/admin" className="block px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-all duration-200 flex items-center space-x-3 group">
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">进入后台</span>
                  </Link>
                </li>
              )}

              <div className="h-px bg-neutral-200/50 dark:bg-white/5 my-1 mx-2" />

              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-3 group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground/80 group-hover:text-red-600 dark:group-hover:text-red-400">退出登录</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
