"use client";

import { Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useAdminTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{
                backgroundColor: theme === 'dark' ? '#3b82f6' : '#e5e7eb'
            }}
            aria-label={`切换到${theme === 'dark' ? '浅色' : '深色'}模式`}
        >
            <motion.div
                className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                animate={{
                    x: theme === 'dark' ? 28 : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
            >
                {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
            </motion.div>
        </button>
    );
}
