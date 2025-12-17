"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Send, CheckCircle } from "lucide-react";

// SearchParams组件包装useSearchParams的使用
function SearchParamsWrapper({ children }: { children: (params: ReturnType<typeof useSearchParams>) => React.ReactNode }) {
  const searchParams = useSearchParams();
  return children(searchParams);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSent, setIsSent] = useState(false);
  const router = useRouter();

  // 表单验证函数
  const validateEmail = (email: string) => {
    if (!email) return "请输入邮箱地址";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "请输入有效的邮箱地址";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const emailValidationError = validateEmail(email);

    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setIsLoading(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage("密码重置链接已发送到您的邮箱！");
      setIsSent(true);

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError("发送密码重置链接失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <SearchParamsWrapper>{
        (searchParams) => {
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
                    <Lock className="w-8 h-8" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">忘记密码</h1>
                  <p className="text-muted-foreground">输入您的邮箱地址，我们将发送密码重置链接</p>
                </div>

                {isSent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6 text-green-600 dark:text-green-400"
                    >
                      <CheckCircle className="w-10 h-10" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">链接已发送！</h2>
                    <p className="text-muted-foreground mb-8">
                      我们已向 {email} 发送了密码重置链接，请检查您的邮箱。
                      <br />
                      链接将在 24 小时后过期。
                    </p>
                    <Button
                      onClick={() => router.push('/login')}
                      className="w-full"
                      size="lg"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      返回登录
                    </Button>
                  </motion.div>
                ) : (
                  <>
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

                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                        rightIcon={<Send className="w-4 h-4" />}
                      >
                        发送重置链接
                      </Button>
                    </form>
                  </>
                )}

                <p className="mt-8 text-center text-sm text-muted-foreground">
                  记得密码了？ {" "}
                  <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    立即登录
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