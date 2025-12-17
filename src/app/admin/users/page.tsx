"use client";
export const runtime = 'edge';

import { useState } from 'react';
import { Shield, Ban, Mail, Edit } from 'lucide-react';
import DataTable, { Column } from '@/admin/components/ui/DataTable';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    status: 'active' | 'banned';
    postsCount: number;
    commentsCount: number;
    joinedAt: string;
}

const mockUsers: User[] = [
    {
        id: '1',
        username: '张三',
        email: 'zhangsan@example.com',
        role: 'admin',
        status: 'active',
        postsCount: 15,
        commentsCount: 48,
        joinedAt: '2023-06-15'
    },
    {
        id: '2',
        username: '李四',
        email: 'lisi@example.com',
        role: 'user',
        status: 'active',
        postsCount: 3,
        commentsCount: 12,
        joinedAt: '2023-12-20'
    },
    // Add more mock data...
];

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const columns: Column<User>[] = [
        {
            key: 'username',
            header: '用户名',
            sortable: true,
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {user.username[0]}
                    </div>
                    <div>
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-xs text-neutral-500">{user.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            header: '角色',
            render: (user) => (
                <span className={`px-2 py-1 rounded-lg text-xs ${user.role === 'admin'
                    ? 'bg-purple-900/30 text-purple-400'
                    : 'bg-blue-900/30 text-blue-400'
                    }`}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                </span>
            )
        },
        {
            key: 'status',
            header: '状态',
            render: (user) => (
                <span className={`px-2 py-1 rounded-lg text-xs ${user.status === 'active'
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-red-900/30 text-red-400'
                    }`}>
                    {user.status === 'active' ? '正常' : '已禁用'}
                </span>
            )
        },
        {
            key: 'postsCount',
            header: '文章数',
            sortable: true,
        },
        {
            key: 'commentsCount',
            header: '评论数',
            sortable: true,
        },
        {
            key: 'joinedAt',
            header: '注册时间',
            sortable: true,
        }
    ];

    const handleBanUser = (id: string) => {
        if (confirm('确定要禁用该用户吗？')) {
            setUsers(users.map(u =>
                u.id === id ? { ...u, status: 'banned' as const } : u
            ));
        }
    };

    const handleActivateUser = (id: string) => {
        setUsers(users.map(u =>
            u.id === id ? { ...u, status: 'active' as const } : u
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">用户管理</h1>
                <p className="text-neutral-400">管理所有注册用户</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                    <div className="text-sm text-neutral-400 mb-1">总用户数</div>
                    <div className="text-2xl font-bold text-white">{users.length}</div>
                </div>
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                    <div className="text-sm text-neutral-400 mb-1">管理员</div>
                    <div className="text-2xl font-bold text-white">
                        {users.filter(u => u.role === 'admin').length}
                    </div>
                </div>
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                    <div className="text-sm text-neutral-400 mb-1">活跃用户</div>
                    <div className="text-2xl font-bold text-white">
                        {users.filter(u => u.status === 'active').length}
                    </div>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={users}
            />
        </div>
    );
}
