"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { User, Mail, MapPin, Globe, Save, Camera, Settings, LogOut } from 'lucide-react';

export default function ProfilePage() {
  // 个人资料状态
  const [showAvatar, setShowAvatar] = useState(true);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('用户名');
  const [email, setEmail] = useState('user@example.com');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 保存设置函数
  const saveProfile = () => {
    setIsLoading(true);
    // 直接保存，无延迟
    setSaved(true);
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-3 text-foreground">
            个人资料
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            管理您的个人信息和社交资料
          </p>
        </motion.div>

        {/* 个人资料卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 p-6 sm:p-8 shadow-xl mb-8"
        >
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mr-4 text-primary">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">基本信息</h2>
          </div>

          <div className="space-y-8">
            {/* 头像设置 */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
                  <Image
                    src="https://picsum.photos/seed/user/200/200.jpg"
                    alt="个人头像"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">头像设置</h3>
                  <p className="text-sm text-muted-foreground">支持 JPG, PNG 格式，最大2MB</p>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showAvatar}
                        onChange={() => setShowAvatar(!showAvatar)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <span className="text-sm font-medium text-foreground">显示头像</span>
                  </label>

                  <Button variant="outline" size="sm">
                    更换头像
                  </Button>
                </div>
              </div>
            </div>

            {/* 基本表单 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="电子邮箱"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">个人简介</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="介绍一下自己吧..."
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 focus:bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 社交信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 p-6 sm:p-8 shadow-xl mb-8"
        >
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mr-4 text-purple-600 dark:text-purple-400">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">社交信息</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="所在地"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例如：北京市"
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <Input
              label="个人网站"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>
        </motion.div>

        {/* 提示信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3"
        >
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-600 dark:text-blue-400">
            网站功能设置请前往 <Link href="/settings" className="font-medium underline underline-offset-4 hover:text-blue-700 dark:hover:text-blue-300">设置</Link> 页面进行管理。
          </p>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button
            onClick={saveProfile}
            size="lg"
            isLoading={isLoading}
            leftIcon={saved ? null : <Save className="w-4 h-4" />}
            className={saved ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {saved ? '已保存' : '保存个人资料'}
          </Button>

          <Button variant="outline" size="lg" leftIcon={<LogOut className="w-4 h-4" />}>
            退出登录
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
