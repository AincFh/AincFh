"use client";
export const runtime = 'edge';

// Next.js 13 admin profile page with API integration
import { useState, useRef, useEffect } from 'react';
import { User, Mail, Shield, Key, Camera, MapPin, Phone, Globe, Github, Twitter, Save, Loader2 } from 'lucide-react';
import { Button } from "@/shared/components/ui/Button";
import { useAdminTheme } from '@/admin/contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function AdminProfilePage() {
    const { theme } = useAdminTheme();
    const [profile, setProfile] = useState({
        username: '',
        role: '',
        email: '',
        bio: '',
        phone: '',
        location: '',
        website: '',
        github: '',
        twitter: '',
        avatar: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/admin/profile');
                if (!res.ok) throw new Error('Failed to load profile');
                const data = await res.json();
                setProfile(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfile(prev => ({ ...prev, avatar: imageUrl }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (!res.ok) throw new Error('Save failed');
            const result = await res.json();
            if (result.success) {
                alert('个人资料已更新！');
            } else {
                throw new Error(result.error || '未知错误');
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">个人资料</h1>
                    <p className="text-gray-500 dark:text-gray-400">管理您的个人信息和账户设置</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    保存修改
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center text-center"
                    >
                        <div className="relative mb-6 group cursor-pointer" onClick={handleAvatarClick}>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <div className={`w-32 h-32 rounded-full overflow-hidden ${!profile.avatar ? 'bg-gradient-to-tr from-blue-500 to-purple-600' : ''}`}>
                                {profile.avatar && <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{profile.username}</h2>
                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">{profile.role}</p>
                        <div className="flex gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30">已验证</span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">活跃状态</span>
                        </div>
                        <div className="w-full pt-6 border-t border-gray-100 dark:border-white/5 flex justify-center gap-4">
                            <button className="p-2 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <Github className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <Globe className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Security Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5"
                    >
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />安全设置
                        </h3>
                        <div className="space-y-4">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                                <Key className="w-4 h-4 text-gray-500" />
                                <div className="text-left">
                                    <div className="font-medium text-gray-900 dark:text-white">修改密码</div>
                                    <div className="text-xs text-gray-500">上次修改3个月前</div>
                                </div>
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-3 h-12 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                                <Shield className="w-4 h-4 text-gray-500" />
                                <div className="text-left">
                                    <div className="font-medium text-gray-900 dark:text-white">双重认证</div>
                                    <div className="text-xs text-green-500">已开启</div>
                                </div>
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5"
                    >
                        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">基本信息</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">用户名</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.username}
                                        onChange={e => setProfile({ ...profile, username: e.target.value })}
                                        className="w-full pl-10 h-11 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">邮箱地址</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                                        className="w-full pl-10 h-11 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">个人简介</label>
                                <textarea
                                    rows={4}
                                    value={profile.bio}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full p-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white resize-none"
                                    placeholder="介绍一下你自己..."
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5"
                    >
                        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">联系方式</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">手机号码</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                        className="w-full pl-10 h-11 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">所在地区</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.location}
                                        onChange={e => setProfile({ ...profile, location: e.target.value })}
                                        className="w-full pl-10 h-11 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">个人网站</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="url"
                                        value={profile.website}
                                        onChange={e => setProfile({ ...profile, website: e.target.value })}
                                        className="w-full pl-10 h-11 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5"
                    >
                        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">社交账号</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.github}
                                        onChange={e => setProfile({ ...profile, github: e.target.value })}
                                        className="w-full pl-10 h-11 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter / X</label>
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.twitter}
                                        onChange={e => setProfile({ ...profile, twitter: e.target.value })}
                                        className="w-full pl-10 h-11 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            {error && <div className="mt-4 text-red-600 dark:text-red-400">{error}</div>}
        </div>
    );
}
