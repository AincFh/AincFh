import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SettingCardProps {
    title: string;
    description?: string;
    children: ReactNode;
    icon?: ReactNode;
    className?: string;
}

export function SettingCard({ title, description, children, icon, className = '' }: SettingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden ${className}`}
        >
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </motion.div>
    );
}

interface SettingItemProps {
    label: string;
    description?: string;
    children: ReactNode;
    layout?: 'horizontal' | 'vertical';
    className?: string;
}

export function SettingItem({ label, description, children, layout = 'horizontal', className = '' }: SettingItemProps) {
    if (layout === 'vertical') {
        return (
            <div className={`space-y-3 ${className}`}>
                <div>
                    <label className="block text-sm font-medium text-neutral-900 dark:text-white">
                        {label}
                    </label>
                    {description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
                <div>{children}</div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 ${className}`}>
            <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-900 dark:text-white">
                    {label}
                </label>
                {description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex-shrink-0">
                {children}
            </div>
        </div>
    );
}
