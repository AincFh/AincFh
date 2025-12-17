"use client";

import { useState, useRef } from 'react';
import { Search, Bell, User, ChevronDown, Settings, LogOut, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';
import ThemeToggle from '@/admin/components/ui/ThemeToggle';
import Link from 'next/link';
import { logout } from '@/frontend/services/auth';

export default function AdminHeader() {
    const { theme } = useAdminTheme();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [unreadCount] = useState(2); // Mock count

    // Refs for click outside detection
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout error:', error);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            window.location.href = '/admin/login';
        }
    };

    return (
        <header
            className="h-16 flex items-center justify-between px-6 z-40 sticky top-0 admin-glass"
            style={{ borderBottom: '1px solid var(--admin-border)' }}
        >
            {/* Search Bar - Spotlight Style */}
            <div className="flex-1 max-w-md">
                <div className={`relative group transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
                    <Search
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-blue-500' : 'text-neutral-400'
                            }`}
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-12 py-2 rounded-xl text-[15px] transition-all duration-200 outline-none admin-input"
                        style={{
                            background: isSearchFocused ? 'var(--admin-surface)' : 'rgba(120, 120, 128, 0.1)',
                            border: isSearchFocused ? '1px solid var(--admin-primary)' : '1px solid transparent',
                            boxShadow: isSearchFocused ? '0 0 0 4px var(--admin-primary-light)' : 'none'
                        }}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                        <span className="text-xs text-neutral-400 font-medium px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">⌘K</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                {/* Notifications */}
                <div
                    className="relative"
                    ref={notifRef}
                    onMouseLeave={() => setShowNotifications(false)}
                >
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                    >
                        <Bell className="w-5 h-5" style={{ color: 'var(--admin-text-secondary)' }} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-black"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="absolute right-0 top-full pt-2 w-80 z-50"
                            >
                                <div className="admin-card overflow-hidden">
                                    <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--admin-border)' }}>
                                        <h3 className="font-semibold text-sm" style={{ color: 'var(--admin-text-primary)' }}>Notifications</h3>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium">2 New</span>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto p-2">
                                        {/* Mock Notifications */}
                                        <div className="p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--admin-text-primary)' }}>New comment on "Design System"</p>
                                                <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>2 minutes ago</p>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--admin-text-primary)' }}>System update completed</p>
                                                <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>1 hour ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Menu */}
                <div
                    className="relative"
                    ref={userMenuRef}
                    onMouseLeave={() => setShowUserMenu(false)}
                >
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-black/20">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}
                            style={{ color: 'var(--admin-text-secondary)' }}
                        />
                    </button>

                    <AnimatePresence>
                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="absolute right-0 top-full pt-2 w-60 z-50"
                            >
                                <div className="admin-card p-1.5">
                                    <div className="px-3 py-2 mb-1">
                                        <p className="text-sm font-medium" style={{ color: 'var(--admin-text-primary)' }}>Admin User</p>
                                        <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>admin@blog.com</p>
                                    </div>
                                    <div className="h-[1px] my-1 mx-2" style={{ background: 'var(--admin-border)' }} />

                                    <Link href="/admin/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm group">
                                        <User className="w-4 h-4" />
                                        <span style={{ color: 'var(--admin-text-primary)' }}>Profile</span>
                                    </Link>
                                    <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm group">
                                        <Settings className="w-4 h-4" />
                                        <span style={{ color: 'var(--admin-text-primary)' }}>Settings</span>
                                    </Link>

                                    <div className="h-[1px] my-1 mx-2" style={{ background: 'var(--admin-border)' }} />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-sm"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="font-medium">Sign Out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
