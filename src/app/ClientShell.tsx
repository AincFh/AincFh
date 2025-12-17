"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/frontend/components/NavBar";
import SearchOverlay from "@/frontend/components/SearchOverlay";
import AIPanel from "@/shared/components/AIPanel";
import PageTransition from "@/shared/components/PageTransition";
import ScrollToTop from "@/frontend/components/ScrollToTop";
import Footer from "@/frontend/components/Footer";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const [user] = useState<null | { id: string; name: string; email: string; avatar: string; role: "admin" | "user" }>({
    id: "1",
    name: "测试用户",
    email: "test@example.com",
    avatar: "https://picsum.photos/seed/testuser/200/200.jpg",
    role: "user"
  });

  // ⭐ 检查是否是后台路由 - 如果是，直接返回children，不包裹前台组件
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  // 前台路由正常处理
  const isFullScreenPage = false;

  const handleSearch = (query: string) => {
    setSearchQuery(query || "");
    setSearchOpen(true);
  };

  const handleOpenLogin = () => {
    setLoginOpen(true);
  };

  const handleOpenOpenAI = () => {
    setAiOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setAiOpen(true);
      }

      if (e.key === "Escape") {
        setSearchOpen(false);
        setAiOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {!isFullScreenPage && (
        <NavBar
          onSearch={handleSearch}
          onOpenLogin={handleOpenLogin}
          onOpenAI={handleOpenOpenAI}
          user={user}
        />
      )}

      <PageTransition>
        {children}
      </PageTransition>

      {!isFullScreenPage && <Footer />}

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        initialQuery={searchQuery}
      />

      <AIPanel
        loggedIn={!!user}
        open={aiOpen}
        onClose={() => setAiOpen(false)}
      />

      <ScrollToTop />
    </>
  );
}
