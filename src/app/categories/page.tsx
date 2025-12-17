"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Palette, Coffee, Wrench, ChevronRight, Calendar, Clock, User, ArrowRight } from "lucide-react";
import { PostService } from "@/shared/services/post-service";

// 分类配置（带图标和颜色）
const categoryConfig: Record<string, { icon: React.ReactNode; gradient: string; description: string }> = {
  "技术": {
    icon: <Code className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-500",
    description: "前端、后端、架构等技术相关文章"
  },
  "设计": {
    icon: <Palette className="w-6 h-6" />,
    gradient: "from-purple-500 to-pink-500",
    description: "UI/UX、设计系统、创意设计相关文章"
  },
  "生活": {
    icon: <Coffee className="w-6 h-6" />,
    gradient: "from-green-500 to-emerald-500",
    description: "生活方式、思考、随笔等生活相关文章"
  },
  "工具": {
    icon: <Wrench className="w-6 h-6" />,
    gradient: "from-orange-500 to-yellow-500",
    description: "工具推荐、效率提升、工作流相关文章"
  }
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryPosts, setCategoryPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取所有分类及文章数量
    const loadCategories = async () => {
      try {
        const allCategories = await PostService.getAllCategories();
        const categoriesWithCount = await Promise.all(
          allCategories.map(async (cat) => {
            const { posts } = await PostService.getPaginatedPosts({ category: cat.id, limit: 100 });
            return {
              id: cat.id,
              name: cat.name,
              count: posts.length
            };
          })
        );
        setCategories(categoriesWithCount);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const loadCategoryPosts = async () => {
        const { posts } = await PostService.getPaginatedPosts({ category: selectedCategory, limit: 10 });
        setCategoryPosts(posts);
      };
      loadCategoryPosts();
    }
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            文章分类
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            按分类浏览所有文章，找到您感兴趣的内容
          </p>
        </motion.header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Bento Grid - 分类卡片 */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {categories.map((category, index) => {
                const config = categoryConfig[category.name] || {
                  icon: <Code className="w-6 h-6" />,
                  gradient: "from-gray-500 to-gray-700",
                  description: "其他分类文章"
                };
                const isSelected = selectedCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`group relative overflow-hidden p-8 rounded-3xl transition-all duration-300 ${isSelected
                      ? 'bg-white dark:bg-neutral-800 shadow-2xl ring-2 ring-primary'
                      : 'bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm hover:shadow-xl border border-neutral-200/50 dark:border-neutral-700/50'
                      }`}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    {/* Icon */}
                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="relative text-left">
                      <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {config.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          {category.count} 篇文章
                        </span>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform ${isSelected ? 'rotate-90' : ''
                          }`} />
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="selectedCategory"
                        className="absolute inset-0 border-2 border-primary rounded-3xl"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </section>

            {/* 分类文章列表 */}
            <AnimatePresence>
              {selectedCategory && categoryPosts.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-3xl p-8 border border-neutral-200 dark:border-neutral-700 shadow-xl">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          {categories.find(c => c.id === selectedCategory)?.name} 分类文章
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          共 {categoryPosts.length} 篇文章
                        </p>
                      </div>
                      <Link
                        href={`/posts?category=${selectedCategory}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group"
                      >
                        查看全部
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {categoryPosts.slice(0, 4).map((post, index) => (
                        <motion.article
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg hover:border-primary/50 transition-all"
                        >
                          <Link href={`/posts/${post.id}`}>
                            <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                              {post.excerpt || "暂无摘要"}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {post.author.username}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                5 min
                              </span>
                            </div>
                          </Link>
                        </motion.article>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </main>
  );
}
