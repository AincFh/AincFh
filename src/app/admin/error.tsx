"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Admin Error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                出错了
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                抱歉，加载此页面时遇到了问题。这可能是由于网络连接或服务器错误引起的。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={reset}
                    variant="default"
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    重试
                </Button>

                <Button
                    onClick={() => window.location.href = '/admin/dashboard'}
                    variant="ghost"
                    className="flex items-center gap-2"
                >
                    <Home className="w-4 h-4" />
                    返回仪表盘
                </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-2xl w-full overflow-auto">
                    <p className="font-mono text-xs text-red-500 mb-2">Error Digest: {error.digest}</p>
                    <pre className="font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {error.message}
                        {'\n'}
                        {error.stack}
                    </pre>
                </div>
            )}
        </div>
    );
}
