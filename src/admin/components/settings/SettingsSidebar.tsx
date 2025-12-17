import { Search, User, Globe, Palette, FileText, Shield, Bell, Sparkles, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface SettingsCategory {
    id: string;
    label: string;
    icon: any;
    color: string;
}

const categories: SettingsCategory[] = [
    { id: 'profile', label: '个人信息', icon: User, color: 'text-blue-500' },
    { id: 'general', label: '通用', icon: Globe, color: 'text-gray-500' },
    { id: 'appearance', label: '外观', icon: Palette, color: 'text-purple-500' },
    { id: 'content', label: '内容', icon: FileText, color: 'text-green-500' },
    { id: 'seo', label: 'SEO 与社交', icon: Search, color: 'text-yellow-500' },
    { id: 'security', label: '安全', icon: Shield, color: 'text-red-500' },
    { id: 'notifications', label: '通知', icon: Bell, color: 'text-orange-500' },
    { id: 'system', label: '系统', icon: Server, color: 'text-indigo-500' },
    { id: 'ai', label: 'AI 助手', icon: Sparkles, color: 'text-pink-500' },
];

interface SettingsSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
            {/* 搜索框 */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索设置..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* 分类列表 */}
            <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 overflow-hidden">
                {filteredCategories.map((category, index) => {
                    const Icon = category.icon;
                    const isActive = activeTab === category.id;

                    return (
                        <button
                            key={category.id}
                            onClick={() => onTabChange(category.id)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative
                                ${index !== filteredCategories.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700/50' : ''}
                                ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/30'
                                }
                            `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeCategoryIndicator"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white dark:bg-neutral-800' : 'bg-neutral-100 dark:bg-neutral-700'}`}>
                                <Icon className={`w-5 h-5 ${isActive ? category.color : 'text-neutral-500 dark:text-neutral-400'}`} />
                            </div>
                            <span className={`text-[15px] font-medium ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                {category.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* 用户信息摘要 (可选) */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-medium text-sm">管理员</div>
                        <div className="text-xs text-white/80">admin@example.com</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
