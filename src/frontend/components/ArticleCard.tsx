import { memo } from "react";
import Image from "next/image";
import Link from "next/link";

// 使用CSS变量预定义分类颜色，减少运行时计算
const CATEGORY_COLORS = {
  "技术": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "设计": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "生活": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
};

interface ArticleCardProps {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  imageUrl?: string;
  image?: string;
  tags?: string[];
  isPreloaded?: boolean;
}

function ArticleCard({
  id,
  title,
  excerpt,
  category,
  author,
  date,
  readTime,
  imageUrl,
  image,
  tags = [],
  isPreloaded = false
}: ArticleCardProps) {
  // 优先使用image属性，其次是imageUrl
  const safeImageUrl = (image || imageUrl) && (image || imageUrl)!.trim() !== '' ? (image || imageUrl)! : null;

  // 使用预定义的分类颜色，默认使用灰色系
  // 更加柔和的配色方案
  const CATEGORY_STYLES = {
    "技术": "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
    "设计": "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-100 dark:border-purple-500/20",
    "生活": "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-100 dark:border-green-500/20"
  };

  const categoryStyle = CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES] ||
    "bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-100 dark:border-neutral-700";

  // 安全的头像URL
  const safeAvatarUrl = author.avatar && author.avatar.trim() !== '' ? author.avatar : "https://picsum.photos/seed/default-avatar/200/200.jpg";

  return (
    <article className="group relative bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden border border-neutral-100 dark:border-white/5 shadow-apple hover:shadow-apple-hover transition-all duration-500 ease-spring hover:-translate-y-2 flex flex-col h-full">
      {/* 文章封面 */}
      <div className="relative h-64 overflow-hidden">
        {safeImageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={safeImageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
              priority={isPreloaded}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.style.background = 'var(--secondary)';
                }
              }}
            />
            {/* 渐变遮罩，增加文字可读性 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ) : (
          <div className="w-full h-full bg-secondary dark:bg-surface-dark flex items-center justify-center">
            <span className="text-muted-foreground/30 text-4xl font-display font-bold opacity-20">Blog</span>
          </div>
        )}

        {/* 顶部标签 - 悬浮感 */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
          <Link
            href={`/categories/${encodeURIComponent(category)}`}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium backdrop-blur-md shadow-sm border ${categoryStyle} transition-transform duration-300 hover:scale-105 active:scale-95`}
          >
            {category}
          </Link>
        </div>
      </div>

      {/* 文章内容 */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-4 flex items-center gap-3 text-xs font-medium text-muted-foreground">
          <span>{date}</span>
          <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <span>{readTime}</span>
        </div>

        <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
          <Link href={`/posts/${id}`} className="focus:outline-none">
            <span className="absolute inset-0 z-0" aria-hidden="true" />
            {title}
          </Link>
        </h3>

        <p className="text-muted-foreground font-body text-[15px] leading-relaxed line-clamp-3 mb-8 flex-1">
          {excerpt}
        </p>

        {/* 底部作者信息 */}
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-neutral-100 dark:border-white/5">
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white dark:ring-neutral-800 shadow-sm">
              <Image
                src={safeAvatarUrl}
                alt={author.name}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {author.name}
            </span>
          </div>

          <div className="text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-spring">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}

// ⚡ Bolt Optimization: Memoize this component to prevent unnecessary re-renders
// especially when list items are preloaded one by one in ArticleListWithPreload.
export default memo(ArticleCard);
