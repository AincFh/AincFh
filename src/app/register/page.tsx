"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Github, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const router = useRouter();

  // 表单验证函数
  const validateUsername = (username: string) => {
    if (!username) return "请输入用户名";
    if (username.length < 3) return "用户名长度至少为3位";
    if (username.length > 20) return "用户名长度不能超过20位";
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) return "用户名只能包含字母、数字、下划线和中文字符";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) return "请输入邮箱地址";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "请输入有效的邮箱地址";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "请输入密码";
    if (password.length < 8) return "密码长度至少8位";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return "密码必须包含大小写字母和数字";
    return "";
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return "请确认密码";
    if (password !== confirmPassword) return "两次输入的密码不一致";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const usernameValidationError = validateUsername(formData.username);
    const emailValidationError = validateEmail(formData.email);
    const passwordValidationError = validatePassword(formData.password);
    const confirmPasswordValidationError = validateConfirmPassword(formData.password, formData.confirmPassword);

    if (usernameValidationError || emailValidationError || passwordValidationError || confirmPasswordValidationError) {
      setFieldErrors({
        username: usernameValidationError,
        email: emailValidationError,
        password: passwordValidationError,
        confirmPassword: confirmPasswordValidationError
      });
      return;
    }

    if (!agreedToTerms) {
      setError("请同意服务条款和隐私政策");
      return;
    }

    setIsLoading(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage("注册成功！正在跳转到登录页面...");
      if (typeof window !== 'undefined') {
        localStorage.setItem('registeredEmail', formData.email);
      }
      setTimeout(() => router.push('/login?registered=true'), 1000);
    } catch (err) {
      setError("注册失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px] opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-8 md:p-10 my-8"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg mb-6 text-white"
          >
            <UserPlus className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">创建账户</h1>
          <p className="text-muted-foreground">加入我们，开启精彩旅程</p>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm font-medium text-center flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {successMessage}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={formData.username}
            onChange={(e) => {
              setFormData({ ...formData, username: e.target.value });
              setFieldErrors({ ...fieldErrors, username: "" });
            }}
            error={fieldErrors.username}
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="邮箱地址"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setFieldErrors({ ...fieldErrors, email: "" });
            }}
            error={fieldErrors.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <Input
                label="密码"
                type={showPassword ? "text" : "password"}
                placeholder="至少8位，含大小写字母和数字"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setFieldErrors({ ...fieldErrors, password: "" });
                }}
                error={fieldErrors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="relative">
              <Input
                label="确认密码"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="再次输入密码"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                }}
                error={fieldErrors.confirmPassword}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>
          </div>

          <div className="flex items-center pt-2">
            <label className="flex items-center space-x-2 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                我同意{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline">
                  服务条款
                </Link>
                {" "}和{" "}
                <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline">
                  隐私政策
                </Link>
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            创建账户
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">或使用以下方式</span>
          </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button variant="outline" leftIcon={<Github className="w-4 h-4" />}>
              GitHub
            </Button>
            <Button variant="outline" leftIcon={<Mail className="w-4 h-4" />}>
              Google
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          已有账户？{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            立即登录
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
