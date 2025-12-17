import { ReactNode } from 'react';

interface SettingGroupProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function SettingGroup({ title, description, children, className = '' }: SettingGroupProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {(title || description) && (
                <div className="px-4">
                    {title && (
                        <h3 className="text-[13px] font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="bg-white dark:bg-neutral-800/50 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700/50">
                {children}
            </div>
        </div>
    );
}

interface SettingRowProps {
    label: string;
    description?: string;
    value?: ReactNode;
    onClick?: () => void;
    showChevron?: boolean;
    children?: ReactNode;
    noBorder?: boolean;
}

export function SettingRow({
    label,
    description,
    value,
    onClick,
    showChevron = false,
    children,
    noBorder = false
}: SettingRowProps) {
    const isInteractive = onClick || showChevron;

    return (
        <div
            className={`
                flex items-center justify-between px-4 py-3.5
                ${!noBorder ? 'border-b border-neutral-200 dark:border-neutral-700/50 last:border-b-0' : ''}
                ${isInteractive ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/30 active:bg-neutral-100 dark:active:bg-neutral-700/50 transition-colors' : ''}
            `}
            onClick={onClick}
        >
            <div className="flex-1 min-w-0 mr-4">
                <div className="text-[15px] font-medium text-neutral-900 dark:text-white">
                    {label}
                </div>
                {description && (
                    <div className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {description}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {value && (
                    <div className="text-[15px] text-neutral-500 dark:text-neutral-400">
                        {value}
                    </div>
                )}
                {children}
                {showChevron && (
                    <svg
                        className="w-5 h-5 text-neutral-400 dark:text-neutral-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                )}
            </div>
        </div>
    );
}
