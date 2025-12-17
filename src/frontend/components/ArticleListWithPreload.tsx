"use client";
import { useState, useEffect } from "react";
import ArticleCard from "./ArticleCard";
import ScrollRevealWithPreload from "@/shared/components/ScrollRevealWithPreload";
import Link from "next/link";

// 模拟文章数据
const initialArticles = [
  {
    id: 1,
    title: "React 18 并发特性深度解析",
    excerpt: "React 18 引入了一系列令人兴奋的新特性，其中最引人注目的就是并发渲染。本文将深入探讨并发渲染的工作原理、Suspense 的新用法以及如何利用这些特性构建更流畅的用户体验。",
    category: "技术",
    author: {
      name: "张三",
      avatar: "https://picsum.photos/seed/author1/100/100.jpg"
    },
    date: "2024-01-15",
    readTime: "8 分钟",
    tags: ["React", "前端", "JavaScript"],
    image: "https://picsum.photos/seed/react18/800/400.jpg"
  },
  {
    id: 2,
    title: "构建可扩展的设计系统：从零到一",
    excerpt: "设计系统是现代产品开发的基石，它不仅确保了视觉一致性，还大大提高了开发效率。本文将分享如何从零开始构建一个可扩展的设计系统，包括设计原则、组件库建设和文档维护。",
    category: "设计",
    author: {
      name: "李四",
      avatar: "https://picsum.photos/seed/author2/100/100.jpg"
    },
    date: "2024-01-12",
    readTime: "12 分钟",
    tags: ["设计系统", "UI/UX", "组件库"],
    image: "https://picsum.photos/seed/design-system/800/400.jpg"
  },
  {
    id: 3,
    title: "极简主义：如何通过减少获得更多",
    excerpt: "在这个物质丰富的时代，我们常常被过多的选择和物品所困扰。极简主义不仅是一种生活方式，更是一种哲学思考。本文分享了我实践极简主义的经历和心得，以及它如何改变了我的生活。",
    category: "生活",
    author: {
      name: "王五",
      avatar: "https://picsum.photos/seed/author3/100/100.jpg"
    },
    date: "2024-01-10",
    readTime: "6 分钟",
    tags: ["极简主义", "生活方式", "思考"],
    image: "https://picsum.photos/seed/minimalism/800/400.jpg"
  }
];

// 模拟更多文章数据
const moreArticles = [
  {
    id: 4,
    title: "TypeScript 高级类型系统实战",
    excerpt: "TypeScript 的类型系统非常强大，但许多开发者只使用了其基础功能。本文将介绍一些高级类型技巧，如条件类型、映射类型和模板字面量类型，帮助你编写更类型安全、更灵活的代码。",
    category: "技术",
    author: {
      name: "赵六",
      avatar: "https://picsum.photos/seed/author4/100/100.jpg"
    },
    date: "2024-01-08",
    readTime: "10 分钟",
    tags: ["TypeScript", "前端", "类型系统"],
    image: "https://picsum.photos/seed/typescript/800/400.jpg"
  },
  {
    id: 5,
    title: "微服务架构中的分布式事务处理",
    excerpt: "在微服务架构中，分布式事务是一个复杂但不可避免的问题。本文将探讨几种常见的分布式事务解决方案，包括两阶段提交、Saga模式和TCC模式，并分析它们的优缺点和适用场景。",
    category: "技术",
    author: {
      name: "钱七",
      avatar: "https://picsum.photos/seed/author5/100/100.jpg"
    },
    date: "2024-01-05",
    readTime: "15 分钟",
    tags: ["微服务", "后端", "架构"],
    image: "https://picsum.photos/seed/microservices/800/400.jpg"
  },
  {
    id: 6,
    title: "创意工作者的时间管理哲学",
    excerpt: "对于创意工作者来说，时间管理不仅仅是提高效率，更是保护创造力和灵感的关键。本文分享了一些适合创意工作者的时间管理方法，帮助你平衡创作与生活，激发更多创意灵感。",
    category: "生活",
    author: {
      name: "孙八",
      avatar: "https://picsum.photos/seed/author6/100/100.jpg"
    },
    date: "2024-01-03",
    readTime: "7 分钟",
    tags: ["时间管理", "创意", "工作方法"],
    image: "https://picsum.photos/seed/timemanagement/800/400.jpg"
  }
];

interface ArticleListWithPreloadProps {
  className?: string;
  preloadDistance?: number;
}

export default function ArticleListWithPreload({
  className = "",
  preloadDistance = 300
}: ArticleListWithPreloadProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [preloadedIds, setPreloadedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 处理文章预加载
  const handlePreload = (articleId: number) => {
    if (!preloadedIds.includes(articleId)) {
      setPreloadedIds(prev => [...prev, articleId]);

      // 模拟预加载文章内容
      // In a real application, you would prefetch the article data here using a query client or fetch
      console.log(`Preloading article ${articleId}`);

      // 如果预加载的是最后一篇文章，则加载更多文章
      if (articleId === articles[articles.length - 1].id && !isLoading) {
        loadMoreArticles();
      }
    }
  };

  // 加载更多文章
  const loadMoreArticles = () => {
    setIsLoading(true);

    // 模拟网络请求延迟
    // TODO: Replace with real API call
    setTimeout(() => {
      setArticles(prev => [...prev, ...moreArticles]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 ${className}`}>
      {articles.map((article, index) => (
        <ScrollRevealWithPreload
          key={article.id}
          delay={100 * index}
          direction="up"
          preloadDistance={preloadDistance}
          onPreload={() => handlePreload(article.id)}
        >
          <ArticleCard
            id={article.id}
            title={article.title}
            excerpt={article.excerpt}
            category={article.category}
            author={article.author}
            date={article.date}
            readTime={article.readTime}
            tags={article.tags}
            image={article.image}
            isPreloaded={preloadedIds.includes(article.id)}
          />
        </ScrollRevealWithPreload>
      ))}

      {/* 加载指示器 - 极简风格 */}
      {isLoading && (
        <div className="col-span-full flex justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2.5 h-2.5 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2.5 h-2.5 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}