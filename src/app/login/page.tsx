"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Mail, Lock, Eye, EyeOff, LogIn, Github, ArrowRight } from "lucide-react";

// SearchParams组件包装useSearchParams的使用
function SearchParamsWrapper({ children }: { children: (params: ReturnType<typeof useSearchParams>) => React.ReactNode }) {
  const searchParams = useSearchParams();
  return children(searchParams);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  // 表单验证函数
  const validateEmail = (email: string) => {
    if (!email) return "请输入邮箱地址";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "请输入有效的邮箱地址";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "请输入密码";
    if (password.length < 6) return "密码长度至少6个字符";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    setIsLoading(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage("登录成功！正在跳转...");

      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        if (rememberMe) localStorage.setItem('rememberMe', 'true');
      }

      setTimeout(() => router.push('/'), 500);
    } catch (err) {
      setError("登录失败，请检查您的邮箱和密码是否正确");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <SearchParamsWrapper>{
        (searchParams) => {
          useEffect(() => {
            const registered = searchParams.get('registered');
            if (registered === 'true') {
              setSuccessMessage("注册成功！正在为您登录...");
              const timer = setTimeout(() => setSuccessMessage(""), 3000);
              return () => clearTimeout(timer);
            }
          }, [searchParams]);

          return (
            <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/40 rounded-full blur-[100px] opacity-50" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-8 md:p-10"
              >
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-lg mb-6 text-white"
                  >
                    <LogIn className="w-8 h-8" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">欢迎回来</h1>
                  <p className="text-muted-foreground">登录您的账户以继续</p>
                </div>

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm font-medium text-center"
                  >
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="邮箱地址"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    error={emailError}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />

                  <div className="relative">
                    <Input
                      label="密码"
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      error={passwordError}
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

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors"
                      />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">记住我</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      忘记密码？
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    登录
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
                  还没有账户？{" "}
                  <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    立即注册
                  </Link>
                </p>
              </motion.div>
            </main>
          );
        }
      }</SearchParamsWrapper>
    </Suspense>
  );
}
