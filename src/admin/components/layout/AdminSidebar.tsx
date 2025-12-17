"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Users,
    Image,
    FolderTree,
    Tags,
    Settings,
    ChevronLeft,
    ChevronRight,
    Command
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';

const menuItems = [
    { name: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: '文章管理', href: '/admin/posts', icon: FileText },
    { name: '评论管理', href: '/admin/comments', icon: MessageSquare },
    { name: '用户管理', href: '/admin/users', icon: Users },
    { name: '媒体库', href: '/admin/media', icon: Image },
    { name: '分类管理', href: '/admin/categories', icon: FolderTree },
    { name: '标签管理', href: '/admin/tags', icon: Tags },
    { name: '系统设置', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { theme } = useAdminTheme();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.aside
            animate={{ width: collapsed ? 80 : 260 }}
            className="h-full z-50 relative flex-shrink-0 admin-glass-heavy"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="flex flex-col h-full">
                {/* Logo Area - Minimalist */}
                <div className="h-16 flex items-center justify-between px-6 mb-4 mt-2">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md">
                                <Command className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-lg tracking-tight" style={{ color: 'var(--admin-text-primary)' }}>
                                Console
                            </span>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-full transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 ml-auto"
                        style={{ color: 'var(--admin-text-secondary)' }}
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2 custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative group block"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 rounded-xl bg-blue-500/10 dark:bg-blue-500/20"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <div
                                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${collapsed ? 'justify-center' : ''
                                        }`}
                                    style={{
                                        color: isActive
                                            ? 'var(--admin-primary)'
                                            : 'var(--admin-text-secondary)'
                                    }}
                                >
                                    <Icon
                                        className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-100' : 'group-hover:scale-105'}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />

                                    {!collapsed && (
                                        <span className={`text-[15px] transition-colors ${isActive ? 'font-medium' : 'font-normal'}`}>
                                            {item.name}
                                        </span>
                                    )}

                                    {/* Collapsed Tooltip */}
                                    {collapsed && (
                                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 backdrop-blur-md shadow-xl">
                                            {item.name}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Profile */}
                <div className="p-4 mx-3 mb-4">
                    <div className={`flex items-center gap-3 p-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex-shrink-0 ring-2 ring-white dark:ring-white/10 overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full" />
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate" style={{ color: 'var(--admin-text-primary)' }}>Admin User</div>
                                <div className="text-xs truncate opacity-80" style={{ color: 'var(--admin-text-secondary)' }}>admin@blog.com</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
