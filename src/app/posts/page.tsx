"use client";

import { useState, useEffect } from "react";
import { PostService } from "@/shared/services/post-service";
import { Post } from "@/shared/types/post";
import ArticleCard from "@/frontend/components/ArticleCard";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/Button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const result = await PostService.getPaginatedPosts({ page: currentPage, limit: postsPerPage });
        setPosts(result.posts);
        setTotalPages(Math.ceil(result.total / postsPerPage));
      } catch (err) {
        setError("获取文章列表失败");
        console.error("获取文章列表失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-32 pb-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-4">加载失败</h2>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-6">
        <header className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 text-foreground"
          >
            所有文章
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            共{posts.length * totalPages} 篇文章，记录技术与生活
          </motion.p>
        </header>

        {posts.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full"
                >
                  <ArticleCard
                    id={parseInt(post.id)}
                    title={post.title}
                    excerpt={post.excerpt || ""}
                    category={post.categories[0]?.name || "未分类"}
                    author={{
                      name: post.author.username,
                      avatar: post.author.avatar || ""
                    }}
                    date={new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    readTime="5 min read" // Mock read time
                    imageUrl={post.coverImage || ""}
                    tags={post.tags.map(t => t.name)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* 分页导航 */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  上一页
                </Button>
                <span className="flex items-center text-sm font-medium text-muted-foreground">
                  第{currentPage}页 / 共{totalPages}页
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">暂无文章</p>
          </div>
        )}
      </div>
    </main>
  );
}
