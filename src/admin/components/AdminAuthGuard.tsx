"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 如果不在登录页面，检查认证状态
        if (!isLoading && pathname !== '/admin/login') {
            if (!user || !isAdmin()) {
                router.push('/admin/login');
            }
        }
    }, [user, isLoading, isAdmin, router, pathname]);

    // 显示加载状态
    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-neutral-400">验证中...</p>
                </div>
            </div>
        );
    }

    // 如果在登录页面，直接显示
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // 如果未登录或不是管理员，显示空白（会被重定向）
    if (!user || !isAdmin()) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-neutral-400">未授权访问，正在跳转...</p>
                </div>
            </div>
        );
    }

    // 已认证且是管理员，显示内容
    return <>{children}</>;
}
