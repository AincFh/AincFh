"use client";
import { useEffect, useState } from "react";

// 模拟文章数据
const mockArticles = [
  { id: 1, title: "React 18 新特性详解", category: "技术", excerpt: "深入了解React 18带来的并发渲染、Suspense等新特性...", date: "2023-12-01", author: "张三" },
  { id: 2, title: "现代Web性能优化实践", category: "技术", excerpt: "探讨现代Web应用性能优化的最佳实践和工具...", date: "2023-11-28", author: "李四" },
  { id: 3, title: "设计系统构建指南", category: "设计", excerpt: "从零开始构建一个可扩展的设计系统...", date: "2023-11-25", author: "王五" },
  { id: 4, title: "TypeScript 高级类型技巧", category: "技术", excerpt: "掌握TypeScript高级类型系统，提升代码质量...", date: "2023-11-20", author: "赵六" },
  { id: 5, title: "极简主义生活哲学", category: "生活", excerpt: "探讨极简主义如何改善我们的生活质量和幸福感...", date: "2023-11-15", author: "钱七" },
  { id: 6, title: "微服务架构设计模式", category: "技术", excerpt: "分析微服务架构中的常见设计模式和最佳实践...", date: "2023-11-10", author: "孙八" },
];

// 模拟标签数据
const mockTags = ["React", "TypeScript", "性能优化", "设计系统", "微服务", "极简主义", "Web开发", "前端架构"];

export default function SearchOverlay({ open, onClose, initialQuery = "" }: { open: boolean; onClose: () => void; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<{ articles: typeof mockArticles; tags: string[] }>({
    articles: [],
    tags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "articles" | "tags">("all");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !open) {
        e.preventDefault();
        // 可以在这里触发搜索框打开的逻辑
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (query.trim() === "") {
      setSearchResults({ articles: [], tags: [] });
      return;
    }

    setIsLoading(true);

    // 调用真实的搜索API
    const fetchSearchResults = async () => {
      try {
        // 搜索文章
        const articlesResponse = await fetch(`/api/frontend/search?q=${encodeURIComponent(query)}`);
        const articlesData = await articlesResponse.json();

        // 搜索标签
        const tagsResponse = await fetch(`/api/frontend/tags`);
        const tagsData = await tagsResponse.json();

        // 过滤标签
        const lowerQuery = query.toLowerCase();
        const filteredTags = tagsData.ok ? tagsData.data.filter((tag: any) =>
          tag.name.toLowerCase().includes(lowerQuery) ||
          tag.slug.toLowerCase().includes(lowerQuery)
        ) : [];

        setSearchResults({
          articles: articlesData.ok ? articlesData.data : [],
          tags: filteredTags
        });
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        setSearchResults({ articles: [], tags: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (!open) return null;

  const hasResults = searchResults.articles.length > 0 || searchResults.tags.length > 0;
  const showArticles = activeTab === "all" || activeTab === "articles";
  const showTags = activeTab === "all" || activeTab === "tags";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24" onClick={onClose}>
      <div className="w-full max-w-3xl mx-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* 搜索输入框 */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、标签..."
            className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
            autoFocus
          />
          <button onClick={onClose} className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-500 dark:border-neutral-400 mb-2"></div>
              <p>搜索中...</p>
            </div>
          ) : query.trim() === "" ? (
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>输入关键词搜索文章或标签</p>
              <p className="text-sm mt-2">试试搜索 "React" 或 "设计系统"</p>
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>未找到与 "{query}" 相关的内容</p>
              <p className="text-sm mt-2">尝试使用其他关键词</p>
            </div>
          ) : (
            <>
              {/* 结果标签页 */}
              {(searchResults.articles.length > 0 && searchResults.tags.length > 0) && (
                <div className="flex border-b border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === "all"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    全部 ({searchResults.articles.length + searchResults.tags.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("articles")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === "articles"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    文章 ({searchResults.articles.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("tags")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === "tags"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    标签 ({searchResults.tags.length})
                  </button>
                </div>
              )}

              {/* 文章结果 */}
              {showArticles && searchResults.articles.length > 0 && (
                <div className="p-4">
                  {(activeTab === "all" && searchResults.tags.length > 0) && (
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">文章</h3>
                  )}
                  <div className="space-y-3">
                    {searchResults.articles.map(article => (
                      <a
                        key={article.id}
                        href={`/posts/${article.id}`}
                        className="block p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        onClick={onClose}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">
                              {article.title}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                              <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-700 dark:text-neutral-300">
                                {article.category}
                              </span>
                              <span>{article.date}</span>
                              <span>{article.author}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 标签结果 */}
              {showTags && searchResults.tags.length > 0 && (
                <div className="p-4">
                  {(activeTab === "all" && searchResults.articles.length > 0) && (
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">标签</h3>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {searchResults.tags.map(tag => (
                      <a
                        key={`tag-${tag}`}
                        href={`/tags/${tag}`}
                        className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        onClick={onClose}
                      >
                        #{tag}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 搜索提示 */}
        <div className="p-3 text-xs text-neutral-500 dark:text-neutral-500 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <span>按 <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700">Esc</kbd> 关闭</span>
            <span>按 <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700">/</kbd> 快速搜索</span>
          </div>
        </div>
      </div>
    </div>
  );
}
