import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export default function AdminNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <FileQuestion className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                页面未找到
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                抱歉，您访问的页面不存在或已被移动。
            </p>

            <Link href="/admin/dashboard">
                <Button variant="default" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    返回仪表盘
                </Button>
            </Link>
        </div>
    );
}
