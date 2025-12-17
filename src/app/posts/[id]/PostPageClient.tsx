"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PostService } from "@/shared/services/post-service";
import { Post } from "@/shared/types/post";
import { motion, useScroll, useSpring } from "framer-motion";
import { Button } from "@/shared/components/ui/Button";
import { ArrowLeft, Clock, Calendar, User, Share2, Heart, Sparkles } from "lucide-react";
import CommentSection from "@/frontend/components/CommentSection";

interface PostPageClientProps {
    postId: string;
}

export default function PostPageClient({ postId }: PostPageClientProps) {
    const [post, setPost] = useState<Post | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [aiOpenHint, setAiOpenHint] = useState(false);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);

                const postData = await PostService.getPostById(postId);
                if (!postData) {
                    setError("文章未找到");
                    setLoading(false);
                    return;
                }

                setPost(postData);

                const relatedData = await PostService.getRelatedPosts(postId, 3);
                setRelatedPosts(relatedData);
            } catch (err) {
                setError("获取文章失败");
                console.error("获取文章失败:", err);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    useEffect(() => {
        const onSelectionChange = () => {
            const sel = window.getSelection()?.toString() || '';
            setAiOpenHint(sel.trim().length > 0);
        };
        document.addEventListener('selectionchange', onSelectionChange);
        return () => document.removeEventListener('selectionchange', onSelectionChange);
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen pt-32 pb-16 flex justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-secondary rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-secondary rounded"></div>
                </div>
            </main>
        );
    }

    if (error || !post) {
        return (
            <main className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold mb-4">文章未找到</h2>
                <p className="text-muted-foreground mb-8">{error || "抱歉,您访问的文章不存在或已被删除"}</p>
                <Link href="/posts">
                    <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>返回文章列表</Button>
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background pt-24 pb-20">
            {/* 滚动进度条 */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
                style={{ scaleX }}
            />

            <article className="max-w-3xl mx-auto px-6">
                {/* 文章头部 */}
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-center space-x-2 mb-6"
                    >
                        {post.categories.length > 0 && (
                            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                                {post.categories[0].name}
                            </span>
                        )}
                        <span className="text-muted-foreground text-xs flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            阅读时间未知
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight"
                    >
                        {post.title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center justify-center space-x-6 text-sm text-muted-foreground"
                    >
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                <img
                                    src={post.author.avatar}
                                    alt={post.author.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="font-medium text-foreground">{post.author.username}</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                        </div>
                    </motion.div>
                </header>

                {/* 文章封面 */}
                <motion.figure
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-12 rounded-3xl overflow-hidden shadow-2xl"
                >
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-auto object-cover"
                    />
                </motion.figure>

                {/* 文章摘要 */}
                <motion.blockquote
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-12 p-8 bg-secondary/50 rounded-2xl border-l-4 border-primary italic text-lg text-muted-foreground"
                >
                    {post.excerpt}
                </motion.blockquote>

                {/* 文章内容 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl prose-img:shadow-lg mb-16"
                    dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                />

                {/* 标签 */}
                <div className="mb-12 flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                            #{tag.name}
                        </span>
                    ))}
                </div>

                {/* 文章操作 */}
                <div className="flex items-center justify-between py-8 border-t border-border/50">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" leftIcon={<Heart className="w-4 h-4" />}>
                            喜欢
                        </Button>
                        <Button variant="ghost" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
                            分享
                        </Button>
                    </div>

                    <Link href="/posts">
                        <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            返回列表
                        </Button>
                    </Link>
                </div>

                {/* 评论区 */}
                <CommentSection postId={postId} />
            </article>

            {/* AI 浮动按钮 */}
            {aiOpenHint && post && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-8 right-8 z-50"
                >
                    <Button
                        onClick={() => {
                            const sel = window.getSelection()?.toString() || '';
                            const detail = { title: post.title, excerpt: post.excerpt, text: sel };
                            window.dispatchEvent(new CustomEvent('open-ai-with-context', { detail }));
                        }}
                        className="shadow-xl"
                        leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                        交给 AI
                    </Button>
                </motion.div>
            )}

            {/* 相关文章 */}
            {relatedPosts.length > 0 && (
                <section className="bg-secondary/30 py-16">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <h2 className="text-2xl font-bold mb-8 text-center">相关文章</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedArticle) => (
                                <Link key={relatedArticle.id} href={`/posts/${relatedArticle.id}`}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="bg-background rounded-2xl overflow-hidden shadow-lg border border-border/50 h-full flex flex-col"
                                    >
                                        <div className="aspect-video bg-muted overflow-hidden">
                                            <img
                                                src={relatedArticle.coverImage}
                                                alt={relatedArticle.title}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                {relatedArticle.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                                {relatedArticle.excerpt}
                                            </p>
                                            <div className="text-xs text-muted-foreground mt-auto">
                                                {new Date(relatedArticle.publishedAt || relatedArticle.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
