"use client";

import { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    MessageSquare,
    Eye,
    TrendingUp,
    Calendar,
    MoreHorizontal,
    ArrowRight,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';
import StatCard from '@/admin/components/ui/StatCard';
import { DashboardSkeleton } from '@/admin/components/ui/Skeleton';

export default function DashboardPage() {
    const { theme } = useAdminTheme();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 直接加载数据，无延迟
        setLoading(false);
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: 'var(--admin-text-primary)' }}>
                        Dashboard
                    </h1>
                    <p className="text-[15px]" style={{ color: 'var(--admin-text-secondary)' }}>
                        Welcome back, here's your blog overview
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="admin-btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20">
                        <FileText className="w-4 h-4" />
                        New Post
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Views"
                    value="128.5k"
                    icon={Eye}
                    trend={12.5}
                    color="blue"
                />
                <StatCard
                    title="Total Posts"
                    value="64"
                    icon={FileText}
                    trend={4.2}
                    color="purple"
                />
                <StatCard
                    title="Comments"
                    value="1,240"
                    icon={MessageSquare}
                    trend={-2.4}
                    color="orange"
                />
                <StatCard
                    title="Users"
                    value="856"
                    icon={Users}
                    trend={8.1}
                    color="green"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <div className="lg:col-span-2 admin-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-semibold text-lg" style={{ color: 'var(--admin-text-primary)' }}>
                                Traffic Overview
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
                                Daily unique visitors
                            </p>
                        </div>
                        <select
                            className="admin-input text-sm py-1.5 px-3"
                            style={{ background: 'var(--admin-bg)' }}
                        >
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last Year</option>
                        </select>
                    </div>

                    {/* Elegant Bar Chart */}
                    <div className="h-72 flex items-end justify-between gap-3 px-2">
                        {[40, 65, 45, 80, 55, 70, 60, 85, 90, 75, 60, 95].map((h, i) => (
                            <div key={i} className="w-full relative group flex flex-col justify-end h-full">
                                <div
                                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 ease-out group-hover:bg-blue-600 relative overflow-hidden"
                                    style={{ height: `${h}%`, opacity: 0.8 }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                </div>
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-xs font-medium py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap z-10 shadow-xl">
                                    {h * 100} Visitors
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 text-xs font-medium" style={{ color: 'var(--admin-text-tertiary)' }}>
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                        <span>Oct</span>
                        <span>Nov</span>
                        <span>Dec</span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="admin-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-semibold text-lg" style={{ color: 'var(--admin-text-primary)' }}>
                            Recent Activity
                        </h3>
                        <button className="text-xs font-medium hover:text-blue-500 transition-colors" style={{ color: 'var(--admin-text-secondary)' }}>
                            View All
                        </button>
                    </div>

                    <div className="space-y-8">
                        {[
                            { text: 'New comment on "Design System"', time: '10 min ago', type: 'comment' },
                            { text: 'User "Alice" registered', time: '2 hours ago', type: 'user' },
                            { text: 'Post "Next.js 14 Features" published', time: '5 hours ago', type: 'post' },
                            { text: 'System backup completed', time: '1 day ago', type: 'system' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="relative">
                                    <div className={`w-2.5 h-2.5 mt-2 rounded-full ring-4 ring-white dark:ring-[#1c1c1e] z-10 relative ${item.type === 'comment' ? 'bg-orange-500' :
                                        item.type === 'user' ? 'bg-green-500' :
                                            item.type === 'post' ? 'bg-blue-500' : 'bg-gray-500'
                                        }`} />
                                    {i !== 3 && (
                                        <div className="absolute top-4 left-[4px] w-[2px] h-full bg-gray-100 dark:bg-gray-800 -z-0" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[15px] font-medium mb-1 transition-colors group-hover:text-blue-500" style={{ color: 'var(--admin-text-primary)' }}>
                                        {item.text}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--admin-text-tertiary)' }}>
                                        {item.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-2.5 text-sm font-medium border rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 group"
                        style={{
                            borderColor: 'var(--admin-border)',
                            color: 'var(--admin-text-secondary)'
                        }}
                    >
                        View Logs <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
