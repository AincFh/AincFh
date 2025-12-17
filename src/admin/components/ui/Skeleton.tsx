"use client";

import { cn } from "@/shared/utils/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "circle" | "text" | "rect";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-neutral-200 dark:bg-neutral-800",
                variant === "circle" && "rounded-full",
                variant === "text" && "h-4 rounded",
                variant === "rect" && "rounded-lg",
                variant === "default" && "rounded-md",
                className
            )}
            {...props}
        />
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" variant="text" />
                    <Skeleton className="h-4 w-64" variant="text" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" variant="rect" />
                    <Skeleton className="h-10 w-32" variant="rect" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" variant="rect" />
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-96 lg:col-span-2" variant="rect" />
                <Skeleton className="h-96" variant="rect" />
            </div>

            {/* Recent Activity Skeleton */}
            <Skeleton className="h-64 w-full" variant="rect" />
        </div>
    );
}
