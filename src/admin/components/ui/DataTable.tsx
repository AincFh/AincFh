"use client";

import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onSearch?: (query: string) => void;
    onFilter?: () => void;
    filters?: {
        label: string;
        options: { value: string; label: string }[];
        value: string;
        onChange: (value: string) => void;
    }[];
    onRowClick?: (item: T) => void;
    loading?: boolean;
}

export default function DataTable<T extends { id: string | number }>({
    columns,
    data,
    onSearch,
    onFilter,
    filters,
    onRowClick,
    loading = false
}: DataTableProps<T>) {
    const { theme } = useAdminTheme();
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    // 简单的客户端排序 (实际项目中通常由服务端处理)
    const sortedData = [...data].sort((a: any, b: any) => {
        if (!sortKey) return 0;
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative max-w-xs w-full">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: theme === 'dark' ? '#707070' : '#adb5bd' }}
                    />
                    <input
                        type="text"
                        placeholder="搜索..."
                        className="w-full pl-10 pr-4 py-2 admin-input text-sm"
                        onChange={(e) => onSearch?.(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* 筛选器 */}
                    {filters && filters.map((filter: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <label className="text-sm text-gray-500 dark:text-gray-400">{filter.label}:</label>
                            <select
                                className="admin-input text-sm"
                                value={filter.value}
                                onChange={(e) => filter.onChange(e.target.value)}
                            >
                                {filter.options.map((option: any) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                    <button
                        className="px-3 py-2 admin-card flex items-center gap-2 text-sm hover:bg-opacity-80"
                        onClick={onFilter}
                    >
                        <Filter className="w-4 h-4" />
                        高级筛选
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="admin-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        style={{ width: col.width }}
                                        className="cursor-pointer hover:bg-opacity-50 transition-colors"
                                        onClick={() => col.sortable && handleSort(col.key as string)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.header}
                                            {col.sortable && (
                                                <span className="text-xs opacity-50">
                                                    {sortKey === col.key ? (
                                                        sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                                    ) : (
                                                        <ArrowUpDown className="w-3 h-3" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                // Loading Skeleton Rows
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        {columns.map((_, j) => (
                                            <td key={j}>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => onRowClick?.(item)}
                                        className="cursor-pointer transition-colors"
                                    >
                                        {columns.map((col, index) => (
                                            <td key={index}>
                                                {col.render ? col.render(item) : (item as any)[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Search className="w-8 h-8 mb-2 opacity-50" />
                                            <p>暂无数据</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: theme === 'dark' ? '#333' : '#e9ecef' }}>
                        <div className="text-sm text-gray-500">
                            显示 {(currentPage - 1) * itemsPerPage + 1} 到 {Math.min(currentPage * itemsPerPage, data.length)} 条，共 {data.length} 条
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm flex items-center">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
