"use client";
export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Palette, Bell, Edit3, Lock, Moon, Sun, Monitor,
  Mail, MessageSquare, Save, CheckCircle, Keyboard, ChevronRight
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

type TabType = 'appearance' | 'notifications' | 'editor' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const [saved, setSaved] = useState(false);

  // Apply theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', 'system');
    }
  }, [theme]);

  const saveSettings = () => {
    setTimeout(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const tabs = [
    { id: 'appearance', label: '外观', icon: Palette, gradient: 'from-purple-500 to-pink-500' },
    { id: 'notifications', label: '通知', icon: Bell, gradient: 'from-orange-500 to-amber-500' },
    { id: 'editor', label: '编辑器', icon: Edit3, gradient: 'from-green-500 to-emerald-500' },
    { id: 'security', label: '安全', icon: Lock, gradient: 'from-red-500 to-rose-500' }
  ] as const;

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            设置中心
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            自定义您的博客体验，管理偏好和功能设置
          </p>
        </motion.header>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8 justify-center"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 ${isActive
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                    : 'bg-white dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700 hover:border-primary/50'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-3xl p-8 border border-neutral-200 dark:border-neutral-700 shadow-xl mb-8"
        >
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">外观设置</h2>
                  <p className="text-sm text-muted-foreground">自定义界面主题和显示选项</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">主题模式</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: '浅色', icon: Sun },
                    { value: 'dark', label: '深色', icon: Moon },
                    { value: 'system', label: '跟随系统', icon: Monitor }
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 ${theme === option.value
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-primary/50'
                          }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${theme === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className={`text-sm font-medium ${theme === option.value ? 'text-primary' : 'text-foreground'}`}>
                          {option.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">通知设置</h2>
                  <p className="text-sm text-muted-foreground">管理通知提醒和消息推送</p>
                </div>
              </div>

              <ToggleOption
                label="启用通知"
                description="接收网站的各种通知提醒"
                checked={notificationsEnabled}
                onChange={setNotificationsEnabled}
              />

              {notificationsEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pl-6 border-l-2 border-neutral-200 dark:border-neutral-700 space-y-4"
                >
                  <ToggleOption
                    label="邮件通知"
                    description="通过邮件接收重要更新"
                    icon={<Mail className="w-4 h-4 text-muted-foreground" />}
                    checked={emailNotifications}
                    onChange={setEmailNotifications}
                  />

                  <ToggleOption
                    label="评论通知"
                    description="有人评论您的文章时收到通知"
                    icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
                    checked={commentNotifications}
                    onChange={setCommentNotifications}
                  />
                </motion.div>
              )}
            </div>
          )}

          {/* Editor Tab */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                <h2 className="text-2xl font-bold text-foreground">编辑器设置</h2>
                <p className="text-sm text-muted-foreground">配置编辑器功能和快捷键</p>
              </div>
              </div>

              <ToggleOption
                label="自动保存草稿"
                description="编辑文章时自动保存草稿"
                icon={<Save className="w-4 h-4 text-muted-foreground" />}
                checked={autoSaveEnabled}
                onChange={setAutoSaveEnabled}
              />

              <ToggleOption
                label="键盘快捷键"
                description="启用键盘快捷键操作"
                icon={<Keyboard className="w-4 h-4 text-muted-foreground" />}
                checked={keyboardShortcuts}
                onChange={setKeyboardShortcuts}
              />
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white shadow-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                <h2 className="text-2xl font-bold text-foreground">安全设置</h2>
                <p className="text-sm text-muted-foreground">管理密码和账户安全</p>
              </div>
              </div>

              <Link href="/profile/security" className="block">
                <div className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">更改密码</p>
                        <p className="text-sm text-muted-foreground">定期更新密码以保证账户安全</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <Link href="/profile" className="block">
                <div className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">账户绑定</p>
                        <p className="text-sm text-muted-foreground">管理第三方账号绑定</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-8 text-sm text-blue-700 dark:text-blue-300">
          <p>个人资料相关设置请前往 <Link href="/profile" className="font-medium underline hover:text-blue-800 dark:hover:text-blue-200">个人资料</Link> 页面进行管理。</p>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={saveSettings}
            disabled={saved}
            leftIcon={saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            className={`px-8 py-4 text-lg ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {saved ? '已保存' : '保存设置'}
          </Button>
        </div>
      </div>
    </main>
  );
}

// Toggle Option Component
function ToggleOption({
  label,
  description,
  checked,
  onChange,
  icon
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1">{icon}</div>}
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}
