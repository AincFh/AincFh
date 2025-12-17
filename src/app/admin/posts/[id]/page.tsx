"use client";

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Save,
    Eye,
    ArrowLeft,
    Upload,
    X,
    Plus
} from 'lucide-react';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';
import { Button } from '@/shared/components/ui/Button';

interface PostFormData {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage: string;
    categoryId: string;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    tags: string[];
}

export default function PostEditorPage() {
    const { theme } = useAdminTheme();
    const router = useRouter();
    const params = useParams();
    const isEditing = params?.id !== 'new';

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PostFormData>({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        coverImage: '',
        categoryId: '',
        status: 'draft',
        featured: false,
        tags: []
    });

    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (isEditing) {
            // 在这里加载文章数据
            // TODO: 实际实现时调用API
        }
    }, [isEditing]);

    const handleSubmit = async (status: 'draft' | 'published') => {
        setLoading(true);
        try {
            // TODO: 实际实现时调用API保存文章
            console.log('保存文章:', { ...formData, status });
            router.push('/admin/posts');
        } catch (error) {
            console.error('保存失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        // 简单的slug生成逻辑
        return title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-\u4e00-\u9fa5]+/g, '');
    };

    const handleTitleChange = (title: string) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#fff' : '#212529' }}>
                            {isEditing ? '编辑文章' : '写文章'}
                        </h1>
                        <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#a0a0a0' : '#6c757d' }}>
                            {isEditing ? '修改并保存您的文章' : '创建一篇新文章'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={() => handleSubmit('draft')}
                        disabled={loading}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        保存草稿
                    </Button>
                    <Button
                        onClick={() => handleSubmit('published')}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        发布
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div className="admin-card p-6">
                        <label className="block text-sm font-medium mb-2">
                            文章标题
                        </label>
                        <input
                            type="text"
                            className="admin-input w-full text-lg font-semibold"
                            placeholder="输入文章标题..."
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                        />
                    </div>

                    {/* Slug */}
                    <div className="admin-card p-6">
                        <label className="block text-sm font-medium mb-2">
                            URL Slug
                        </label>
                        <input
                            type="text"
                            className="admin-input w-full"
                            placeholder="文章URL标识..."
                            value={formData.slug}
                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        />
                        <p className="text-xs mt-2" style={{ color: theme === 'dark' ? '#707070' : '#adb5bd' }}>
                            预览URL: /posts/{formData.slug || 'your-post-slug'}
                        </p>
                    </div>

                    {/* Content Editor */}
                    <div className="admin-card p-6">
                        <label className="block text-sm font-medium mb-2">
                            文章内容
                        </label>
                        <textarea
                            className="admin-input w-full min-h-[400px] font-mono text-sm"
                            placeholder="使用 Markdown 编写文章内容..."
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        />
                        <p className="text-xs mt-2" style={{ color: theme === 'dark' ? '#707070' : '#adb5bd' }}>
                            支持 Markdown 格式
                        </p>
                    </div>

                    {/* Excerpt */}
                    <div className="admin-card p-6">
                        <label className="block text-sm font-medium mb-2">
                            文章摘要
                        </label>
                        <textarea
                            className="admin-input w-full"
                            rows={3}
                            placeholder="简要描述文章内容..."
                            value={formData.excerpt}
                            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Cover Image */}
                    <div className="admin-card p-6">
                        <label className="block text-sm font-medium mb-3">
                            封面图片
                        </label>
                        {formData.coverImage ? (
                            <div className="relative">
                                <img
                                    src={formData.coverImage}
                                    alt="Cover"
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                style={{ borderColor: theme === 'dark' ? '#333' : '#e9ecef' }}
                            >
                                <Upload className="w-6 h-6" style={{ color: theme === 'dark' ? '#707070' : '#adb5bd' }} />
                                <span className="text-sm" style={{ color: theme === 'dark' ? '#707070' : '#adb5bd' }}>
                                    点击上传封面
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Category */}
                    <div className="admin-card p-6">
                        <label className="block text-sm font-medium mb-3">
                            分类
                        </label>
                        <select
                            className="admin-input w-full"
                            value={formData.categoryId}
                            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                        >
                            <option value="">选择分类</option>
                            <option value="1">技术</option>
                            <option value="2">生活</option>
                            <option value="3">随笔</option>
                        </select>
                    </div>

                    {/* Tags */}
                    <div className="admin-card p-6">
                        <label className="block text-sm font-medium mb-3">
                            标签
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                className="admin-input flex-1"
                                placeholder="添加标签..."
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            />
                            <button
                                onClick={addTag}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm flex items-center gap-2"
                                >
                                    {tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Featured */}
                    <div className="admin-card p-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.featured}
                                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">
                                设为精选文章
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
