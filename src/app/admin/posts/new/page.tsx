"use client";
export const runtime = 'edge';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';
import { Button } from "@/shared/components/ui/Button";

export default function NewPostPage() {
    const { theme } = useAdminTheme();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');

    const handleSave = async () => {
        if (!title) return;
        setSaving(true);
        // 直接执行保存逻辑
        setSaving(false);
        router.push('/admin/posts');
    };

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
                        写文章
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => router.back()}>
                        取消
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !title}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        发布文章
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
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">点击上传封面</span>
                        </div>
                    </div>

                    {/* Publishing Settings */}
                    <div className="admin-card p-4 space-y-4">
                        <h3 className="font-medium" style={{ color: theme === 'dark' ? '#fff' : '#212529' }}>发布设置</h3>

                        <div>
                            <label className="block text-sm mb-1.5 text-gray-500">分类</label>
                            <select className="w-full admin-input text-sm">
                                <option>选择分类...</option>
                                <option>技术</option>
                                <option>生活</option>
                                <option>随笔</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1.5 text-gray-500">标签</label>
                            <input
                                type="text"
                                placeholder="输入标签，回车添加"
                                className="w-full admin-input text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1.5 text-gray-500">摘要</label>
                            <textarea
                                rows={3}
                                className="w-full admin-input text-sm resize-none"
                                placeholder="文章摘要..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
