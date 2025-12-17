"use client";

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: number;
    trendLabel?: string;
    color?: 'blue' | 'purple' | 'green' | 'orange';
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel = "vs last week",
    color = 'blue'
}: StatCardProps) {
    const { theme } = useAdminTheme();

    const getColorStyles = () => {
        const colors = {
            blue: {
                light: { bg: 'rgba(0, 113, 227, 0.1)', text: '#0071e3', gradient: 'from-blue-500/10 to-blue-600/5' },
                dark: { bg: 'rgba(10, 132, 255, 0.15)', text: '#0a84ff', gradient: 'from-blue-500/10 to-blue-600/5' }
            },
            purple: {
                light: { bg: 'rgba(175, 82, 222, 0.1)', text: '#af52de', gradient: 'from-purple-500/10 to-purple-600/5' },
                dark: { bg: 'rgba(191, 90, 242, 0.15)', text: '#bf5af2', gradient: 'from-purple-500/10 to-purple-600/5' }
            },
            green: {
                light: { bg: 'rgba(52, 199, 89, 0.1)', text: '#34c759', gradient: 'from-green-500/10 to-green-600/5' },
                dark: { bg: 'rgba(48, 209, 88, 0.15)', text: '#30d158', gradient: 'from-green-500/10 to-green-600/5' }
            },
            orange: {
                light: { bg: 'rgba(255, 149, 0, 0.1)', text: '#ff9500', gradient: 'from-orange-500/10 to-orange-600/5' },
                dark: { bg: 'rgba(255, 159, 10, 0.15)', text: '#ff9f0a', gradient: 'from-orange-500/10 to-orange-600/5' }
            }
        };
        return theme === 'dark' ? colors[color].dark : colors[color].light;
    };

    const styles = getColorStyles();

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="admin-card p-6 relative overflow-hidden group cursor-pointer"
        >
            {/* Subtle Gradient Background on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-[15px] font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>
                            {title}
                        </p>
                        <h3 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--admin-text-primary)' }}>
                            {value}
                        </h3>
                    </div>
                    <div
                        className="p-3 rounded-xl transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: styles.bg, color: styles.text }}
                    >
                        <Icon className="w-6 h-6" />
                    </div>
                </div>

                {trend !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                        <span
                            className={`flex items-center font-medium px-2 py-0.5 rounded-full text-xs ${trend > 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                trend < 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                    'bg-gray-500/10 text-gray-500'
                                }`}
                        >
                            {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> :
                                trend < 0 ? <ArrowDownRight className="w-3 h-3 mr-1" /> :
                                    <Minus className="w-3 h-3 mr-1" />}
                            {Math.abs(trend)}%
                        </span>
                        <span style={{ color: 'var(--admin-text-tertiary)' }} className="text-xs">
                            {trendLabel}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
