"use client";

import { useState } from 'react';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// 导入组件
import { SettingsSidebar } from '@/admin/components/settings/SettingsSidebar';
import { ProfileSettings } from '@/admin/components/settings/ProfileSettings';
import { GeneralSettings } from '@/admin/components/settings/GeneralSettings';
import { AppearanceSettings } from '@/admin/components/settings/AppearanceSettings';
import { ContentSettings } from '@/admin/components/settings/ContentSettings';
import { SEOSettings } from '@/admin/components/settings/SEOSettings';
import { SecuritySettings } from '@/admin/components/settings/SecuritySettings';
import { NotificationSettings } from '@/admin/components/settings/NotificationSettings';
import { SystemSettings } from '@/admin/components/settings/SystemSettings';
import { AISettings } from '@/admin/components/settings/AISettings';
import { Button } from '@/shared/components/ui/Button';

export default function AdminSettingsPage() {
    const { theme, setTheme } = useAdminTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [settings, setSettings] = useState({
        profile: {
            twoFactorEnabled: false,
        },
        general: {
            siteTitle: 'My Awesome Blog',
            siteDescription: '分享技术与生活的点滴',
            siteKeywords: '博客,技术,生活',
            postsPerPage: 10,
            defaultPostStatus: 'published',
            autoSaveInterval: 60,
        },
        appearance: {
            theme: theme as 'light' | 'dark',
            homeLayout: 'grid',
            articleCardStyle: 'modern',
            pageTransitions: true,
            scrollAnimations: true,
        },
        content: {
            postsPerPage: 10,
            autoSave: true,
            commentsEnabled: true,
            commentModeration: true,
            spamProtection: true,
        },
        seo: {
            robotsTxt: 'User-agent: *\nAllow: /',
            sitemapEnabled: true,
            ogImage: '',
            twitterCard: 'summary_large_image',
            googleAnalyticsId: '',
        },
        security: {
            passwordComplexity: 'medium',
            twoFactorAuth: true,
            maxLoginAttempts: 5,
            commentModeration: true,
            spamProtection: true,
            cookieConsent: true,
        },
        notifications: {
            emailEnabled: true,
            smtpServer: 'smtp.example.com',
            smtpPort: 587,
            fromEmail: 'noreply@example.com',
            newCommentNotification: true,
            newUserNotification: true,
        },
        system: {
            maintenanceMode: false,
            debugMode: false,
            allowRegistration: true,
            version: '1.0.0',
        },
        ai: {
            provider: 'local',
            apiKey: '',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 500,
        },
    });

    const updateSetting = (section: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                [key]: value,
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus('idle');

        try {
            // 保存主题设置
            if (settings.appearance.theme !== theme && ['light', 'dark'].includes(settings.appearance.theme)) {
                setTheme(settings.appearance.theme as 'light' | 'dark');
            }

            // 模拟 API 调用
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings settings={settings.profile} updateSetting={updateSetting} />;
            case 'general':
                return <GeneralSettings settings={settings.general} updateSetting={updateSetting} />;
            case 'appearance':
                return <AppearanceSettings settings={settings.appearance} updateSetting={updateSetting} theme={theme} setTheme={setTheme} />;
            case 'content':
                return <ContentSettings settings={settings.content} updateSetting={updateSetting} />;
            case 'seo':
                return <SEOSettings settings={settings.seo} updateSetting={updateSetting} />;
            case 'security':
                return <SecuritySettings settings={settings.security} updateSetting={updateSetting} />;
            case 'notifications':
                return <NotificationSettings settings={settings.notifications} updateSetting={updateSetting} />;
            case 'system':
                return <SystemSettings settings={settings.system} updateSetting={updateSetting} />;
            case 'ai':
                return <AISettings settings={settings.ai} updateSetting={updateSetting} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 dark:bg-black -m-8 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                            设置
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            管理您的博客配置和偏好设置
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {saveStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>保存成功</span>
                            </motion.div>
                        )}
                        {saveStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
                            >
                                <AlertCircle className="w-4 h-4" />
                                <span>保存失败</span>
                            </motion.div>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    保存更改
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="flex-1 min-w-0 overflow-x-hidden">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
