export const runtime = 'edge';

// 模拟分类数据
const mockCategories = [
  {
    name: "技术",
    count: 15,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    description: "前端、后端、架构等技术相关文章",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    name: "设计",
    count: 8,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    description: "UI/UX、设计系统、创意设计相关文章",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    )
  },
  {
    name: "生活",
    count: 12,
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    description: "生活方式、思考、随笔等生活相关文章",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    name: "工具",
    count: 6,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    description: "工具推荐、效率提升、工作流相关文章",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

// 模拟分类下的文章数据
const mockCategoryArticles: Record<string, any[]> = {
  "技术": [
    {
      id: 1,
      title: "React 18 并发特性深度解析",
      excerpt: "React 18 引入了一系列令人兴奋的新特性,其中最引人注目的就是并发渲染。本文将深入探讨并发渲染的工作原理、Suspense 的新用法以及如何利用这些特性构建更流畅的用户体验。",
      author: "张三",
      date: "2024-01-15",
      readTime: "8 分钟",
      tags: ["React", "前端", "JavaScript"],
      image: "https://picsum.photos/seed/react18/800/400.jpg"
    },
    {
      id: 2,
      title: "TypeScript 高级类型系统实战",
      excerpt: "TypeScript 的类型系统非常强大,但许多开发者只使用了其基础功能。本文将介绍一些高级类型技巧,如条件类型、映射类型和模板字面量类型,帮助你编写更类型安全、更灵活的代码。",
      author: "赵六",
      date: "2024-01-08",
      readTime: "10 分钟",
      tags: ["TypeScript", "前端", "类型系统"],
      image: "https://picsum.photos/seed/typescript/800/400.jpg"
    },
  ],
  "设计": [
    {
      id: 4,
      title: "构建可扩展的设计系统:从零到一",
      excerpt: "设计系统是现代产品开发的基石,它不仅确保了视觉一致性,还大大提高了开发效率。本文将分享如何从零开始构建一个可扩展的设计系统,包括设计原则、组件库建设和文档维护。",
      author: "李四",
      date: "2024-01-12",
      readTime: "12 分钟",
      tags: ["设计系统", "UI/UX", "组件库"],
      image: "https://picsum.photos/seed/design-system/800/400.jpg"
    }
  ],
  "生活": [
    {
      id: 5,
      title: "极简主义:如何通过减少获得更多",
      excerpt: "在这个物质丰富的时代,我们常常被过多的选择和物品所困扰。极简主义不仅是一种生活方式,更是一种哲学思考。本文分享了我实践极简主义的经历和心得,以及它如何改变了我的生活。",
      author: "王五",
      date: "2024-01-10",
      readTime: "6 分钟",
      tags: ["极简主义", "生活方式", "思考"],
      image: "https://picsum.photos/seed/minimalism/800/400.jpg"
    },
  ],
  "工具": [
    {
      id: 7,
      title: "提升开发效率的VS Code插件推荐",
      excerpt: "VS Code 是目前最受欢迎的代码编辑器之一,通过安装合适的插件可以大大提高开发效率。本文将分享一些实用的VS Code插件,帮助你打造更高效的开发环境。",
      author: "周九",
      date: "2024-01-01",
      readTime: "5 分钟",
      tags: ["VS Code", "插件", "效率"],
      image: "https://picsum.photos/seed/vscode/800/400.jpg"
    }
  ]
};

export default async function CategoryDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  const categoryData = mockCategories.find(c => c.name === decodedCategory);
  const articles = mockCategoryArticles[decodedCategory] || [];

  if (!categoryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-2xl font-semibold mb-4">分类未找到</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          抱歉,您访问的分类不存在或已被移除。
        </p>
        <a
          href="/categories"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          浏览所有分类
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <a href="/categories" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回分类
        </a>

        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryData.color.replace('text-', 'bg-').replace('dark:', 'dark:bg-').replace('/30', '/50')}`}>
            {categoryData.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              分类:{decodedCategory}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {categoryData.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryData.color}`}>
            {articles.length} 篇文章
          </span>
        </div>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article key={article.id} className="group bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              {/* 文章封面 */}
              <div className="relative h-48 overflow-hidden">
                {article.image && article.image.trim() !== '' ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* 分类标签 */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium ${categoryData.color}`}>
                    {decodedCategory}
                  </span>
                </div>

                {/* 阅读时间 */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                    {article.readTime}
                  </span>
                </div>
              </div>

              {/* 文章内容 */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                  <a href={`/posts/${article.id}`}>
                    {article.title}
                  </a>
                </h3>

                <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={`tag-${tag}-${index}`}
                      className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-md text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-md text-xs">
                      +{article.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* 作者和日期 */}
                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                  <span>{article.author}</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            暂无文章
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            该分类下还没有发布任何文章
          </p>
        </div>
      )}
    </div>
  );
}