"use client";

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';
import { Button } from "@/shared/components/ui/Button";
import { Post } from '@/shared/types/post';

export default function EditPostPage() {
    const { theme } = useAdminTheme();
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [post, setPost] = useState<Post>({
        id: postId,
        title: '',
        content: '',
        excerpt: '',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'admin',
        author: {
            id: 'admin',
            username: '管理员',
            avatar: 'https://picsum.photos/seed/admin/100/100.jpg'
        },
        categories: [],
        tags: [],
        slug: ''
    });

    // 获取文章数据
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/admin/posts/${postId}`);
                const data = await response.json();
                if (data.ok) {
                    setPost(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    const handleSave = async () => {
        if (!post.title) return;
        setSaving(true);
        try {
            const response = await fetch(`/api/admin/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(post),
            });
            const data = await response.json();
            if (data.ok) {
                router.push('/admin/posts');
            }
        } catch (error) {
            console.error('Failed to save post:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" style={{ color: theme === 'dark' ? '#fff' : '#212529' }} />
                    </button>
                    <h1 className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#fff' : '#212529' }}>
                        编辑文章
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => router.back()}>
                        取消
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !post.title}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        保存更改
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Editor Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title Input */}
                    <input
                        type="text"
                        placeholder="输入文章标题..."
                        value={post.title}
                        onChange={(e) => setPost({ ...post, title: e.target.value })}
                        className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder-gray-400"
                        style={{ color: theme === 'dark' ? '#fff' : '#212529' }}
                        autoFocus
                    />

                    {/* Editor Placeholder */}
                    <div
                        className="min-h-[500px] p-6 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-gray-400"
                        style={{
                            borderColor: theme === 'dark' ? '#333' : '#e9ecef',
                            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa'
                        }}
                    >
                        <p>Markdown 编辑器即将上线...</p>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    {/* Cover Image */}
                    <div className="admin-card p-4">
                        <h3 className="font-medium mb-3" style={{ color: theme === 'dark' ? '#fff' : '#212529' }}>封面图</h3>
                        <div
                            className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            style={{ borderColor: theme === 'dark' ? '#333' : '#e9ecef' }}
                        >
                            {post.coverImage ? (
                                <img
                                    src={post.coverImage}
                                    alt="Cover Image"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">点击上传封面</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Publishing Settings */}
                    <div className="admin-card p-4 space-y-4">
                        <h3 className="font-medium" style={{ color: theme === 'dark' ? '#fff' : '#212529' }}>发布设置</h3>

                        <div>
                            <label className="block text-sm mb-1.5 text-gray-500">分类</label>
                            <select
                                className="w-full admin-input text-sm"
                                value={post.categories[0]?.id || ''}
                                onChange={(e) => {
                                    // 简化处理，实际应用中应该从分类列表中获取完整分类对象
                                    setPost({
                                        ...post,
                                        categories: e.target.value ? [{
                                            id: e.target.value,
                                            name: e.target.selectedOptions[0].text,
                                            slug: e.target.value,
                                            createdAt: new Date()
                                        }] : []
                                    });
                                }}
                            >
                                <option value="">选择分类...</option>
                                <option value="1">技术</option>
                                <option value="2">生活</option>
                                <option value="3">随笔</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1.5 text-gray-500">标签</label>
                            <input
                                type="text"
                                placeholder="输入标签，回车添加"
                                className="w-full admin-input text-sm"
                                value={post.tags.map(tag => tag.name).join(', ')}
                                onChange={(e) => {
                                    // 简化处理，实际应用中应该支持添加多个标签
                                    const tagNames = e.target.value.split(',').map(name => name.trim()).filter(Boolean);
                                    setPost({
                                        ...post,
                                        tags: tagNames.map((name, index) => ({
                                            id: (index + 1).toString(),
                                            name,
                                            slug: name.toLowerCase().replace(/\s+/g, '-'),
                                            createdAt: new Date()
                                        }))
                                    });
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1.5 text-gray-500">摘要</label>
                            <textarea
                                rows={3}
                                className="w-full admin-input text-sm resize-none"
                                placeholder="文章摘要..."
                                value={post.excerpt}
                                onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1.5 text-gray-500">状态</label>
                            <select
                                className="w-full admin-input text-sm"
                                value={post.status}
                                onChange={(e) => setPost({ ...post, status: e.target.value as 'published' | 'draft' | 'archived' })}
                            >
                                <option value="draft">草稿</option>
                                <option value="published">已发布</option>
                                <option value="archived">已归档</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
