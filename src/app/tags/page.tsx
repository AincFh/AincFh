"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, ChevronDown, Calendar, Clock, User, ArrowRight, Search, SortAsc } from "lucide-react";
import { PostService } from "@/shared/services/post-service";

export default function TagsPage() {
  const [tags, setTags] = useState<{ id: string; name: string; count: number }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagPosts, setTagPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "count">("count");

  useEffect(() => {
    const loadTags = async () => {
      try {
        const allTags = await PostService.getAllTags();
        const popularTags = await PostService.getPopularTags();

        const tagsWithCount = allTags.map(tag => {
          const popularTag = popularTags.find(pt => pt.tag === tag.id);
          return {
            id: tag.id,
            name: tag.name,
            count: popularTag?.count || 0
          };
        });

        setTags(tagsWithCount);
      } catch (error) {
        console.error('Failed to load tags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  useEffect(() => {
    if (selectedTag) {
      const loadTagPosts = async () => {
        const { posts } = await PostService.getPaginatedPosts({ tag: selectedTag, limit: 6 });
        setTagPosts(posts);
      };
      loadTagPosts();
    }
  }, [selectedTag]);

  const handleTagClick = (tagId: string) => {
    setSelectedTag(selectedTag === tagId ? null : tagId);
  };

  // Filter and sort tags
  const filteredTags = tags
    .filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "count") return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

  // Calculate tag size based on count
  const getTagSize = (count: number) => {
    const maxCount = Math.max(...tags.map(t => t.count), 1);
    const ratio = count / maxCount;

    if (ratio > 0.7) return "text-3xl";
    if (ratio > 0.5) return "text-2xl";
    if (ratio > 0.3) return "text-xl";
    return "text-lg";
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            标签�?          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            按标签浏览所有文章，探索更多相关内容
          </p>
        </motion.header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-4 mb-12 justify-between items-center"
            >
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("count")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${sortBy === "count"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-white dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700"
                    }`}
                >
                  <SortAsc className="w-4 h-4" />
                  按热�?                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${sortBy === "name"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-white dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700"
                    }`}
                >
                  <SortAsc className="w-4 h-4" />
                  按名�?                </button>
              </div>
            </motion.div>

            {/* Tags Cloud */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex flex-wrap justify-center gap-3 p-8 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-xl min-h-[300px]">
                {filteredTags.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Hash className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>未找到匹配的标签</p>
                  </div>
                ) : (
                  filteredTags.map((tag, index) => {
                    const isSelected = selectedTag === tag.id;
                    const sizeClass = getTagSize(tag.count);

                    return (
                      <motion.button
                        key={tag.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02, type: "spring", damping: 20 }}
                        whileHover={{ scale: 1.1, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTagClick(tag.id)}
                        className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${sizeClass} font-medium ${isSelected
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 ring-2 ring-purple-400"
                            : "bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 text-foreground hover:from-primary/20 hover:to-primary/30 hover:text-primary border border-neutral-300 dark:border-neutral-600"
                          }`}
                      >
                        <Hash className={`${isSelected ? 'w-5 h-5' : 'w-4 h-4'} transition-all`} />
                        {tag.name}
                        <span className={`text-xs opacity-75 ${isSelected ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'} rounded-full px-2 py-0.5`}>
                          {tag.count}
                        </span>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Stats */}
              <div className="mt-8 text-center text-sm text-muted-foreground">
                �?<span className="font-bold text-primary">{filteredTags.length}</span> 个标�?                {searchQuery && ` · 筛选自 ${tags.length} 个标签`}
              </div>
            </motion.section>

            {/* Selected Tag Posts */}
            <AnimatePresence>
              {selectedTag && tagPosts.length > 0 && (
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
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                          <Hash className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            {tags.find(t => t.id === selectedTag)?.name} 标签
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            �?{tagPosts.length} 篇文�?                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/posts?tag=${selectedTag}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group"
                      >
                        查看全部
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tagPosts.map((post, index) => (
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
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {post.author.username}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
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
