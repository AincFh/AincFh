export const runtime = 'edge';

// 模拟归档数据
const mockArchiveData = {
  "2025-11": [
    {
      id: 1,
      title: "Next.js 14 新特性探索",
      excerpt: "Next.js 14 带来了许多令人兴奋的新特性,包括改进的性能、更好的开发体验和新的API。本文将深入探讨这些特性...",
      date: "2025-11-15",
      author: "博主",
      readTime: "8分钟",
      category: "前端",
      tags: ["前端", "Next.js", "React"]
    },
    {
      id: 2,
      title: "TypeScript 高级类型技巧",
      excerpt: "TypeScript 的类型系统非常强大,掌握一些高级类型技巧可以让你的代码更加健壮和易于维护...",
      date: "2025-11-10",
      author: "博主",
      readTime: "12分钟",
      category: "前端",
      tags: ["前端", "TypeScript", "技术"]
    },
    {
      id: 3,
      title: "使用 Tailwind CSS 构建响应式设计",
      excerpt: "Tailwind CSS 是一个功能强大的实用优先的 CSS 框架,它可以帮助你快速构建响应式设计...",
      date: "2025-11-05",
      author: "博主",
      readTime: "6分钟",
      category: "前端",
      tags: ["前端", "CSS", "设计"]
    }
  ],
  "2025-10": [
    {
      id: 4,
      title: "React 18 并发特性详解",
      excerpt: "React 18 引入了许多并发特性,如 Suspense、并发渲染和自动批处理等,这些特性可以显著提升应用性能...",
      date: "2025-10-28",
      author: "博主",
      readTime: "10分钟",
      category: "前端",
      tags: ["前端", "React", "技术"]
    },
    {
      id: 5,
      title: "Vite vs Webpack:构建工具对比",
      excerpt: "Vite 和 Webpack 都是流行的前端构建工具,但它们在设计理念和使用体验上有很大差异...",
      date: "2025-10-20",
      author: "博主",
      readTime: "7分钟",
      category: "前端",
      tags: ["前端", "工具", "技术"]
    }
  ]
};

export default async function ArchiveDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articles = mockArchiveData[slug as keyof typeof mockArchiveData] || [];

  // 从slug中提取年月
  const [year, month] = slug.includes('-') ? slug.split('-') : [slug, '01'];
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const monthName = monthNames[parseInt(month) - 1] || month;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <a href="/archive" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回归档
        </a>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {year}年{monthName}归档
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          共 {articles.length} 篇文章
        </p>
      </div>

      {/* 文章列表 */}
      {articles.length > 0 ? (
        <div className="space-y-6">
          {articles.map((article) => (
            <article key={article.id} className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <a href={`/categories/${encodeURIComponent(article.category)}`} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                    {article.category}
                  </a>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {article.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-semibold mb-2">
                  <a href={`/posts/${article.id}`} className="text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {article.title}
                  </a>
                </h2>

                <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{article.date}</span>
                    <span>{article.author}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag) => (
                      <a
                        key={`article-tag-${article.id}-${tag}`}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="px-2 py-1 bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 rounded text-xs hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 text-center shadow-sm border border-neutral-200 dark:border-neutral-700">
          <svg className="w-12 h-12 mx-auto mb-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-neutral-600 dark:text-neutral-400">
            该月份暂无文章
          </p>
        </div>
      )}
    </div>
  );
}