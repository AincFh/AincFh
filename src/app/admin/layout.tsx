"use client";

import { usePathname } from 'next/navigation';
import AdminSidebar from '@/admin/components/layout/AdminSidebar';
import AdminHeader from '@/admin/components/layout/AdminHeader';
import { AuthProvider } from '@/admin/contexts/AuthContext';
import { AdminAuthGuard } from '@/admin/components/AdminAuthGuard';
import { AdminThemeProvider } from '@/admin/contexts/ThemeContext';
import AIAssistant from '@/admin/components/ai/AIAssistant';
import '@/admin/styles/admin-theme.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // 🔒 如果是登录页面，不显示后台布局组件
    const isLoginPage = pathname === '/admin/login';

    return (
        <AuthProvider>
            <AdminThemeProvider>
                {isLoginPage ? (
                    // 登录页：完全干净
                    <div className="min-h-screen bg-neutral-950">
                        {children}
                    </div>
                ) : (
                    // 后台页面：需要认证，显示完整布局
                    <AdminAuthGuard>
                        <div className="flex h-screen admin-container overflow-hidden">
                            <AdminSidebar />
                            <div className="flex-1 flex flex-col overflow-hidden relative">
                                <AdminHeader />
                                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                                    {children}
                                </main>
                                <AIAssistant />
                            </div>
                        </div>
                    </AdminAuthGuard>
                )}
            </AdminThemeProvider>
        </AuthProvider>
    );
}
