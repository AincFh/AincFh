// 前端 API 服务层 - 统计数据
import { getAuthToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Stats {
    posts: number;
    users: number;
    comments: number;
    categories: number;
    pendingComments: number;
    totalViews: number;
    recentPosts: Array<{
        id: number;
        title: string;
        status: string;
        created_at: number;
    }>;
}

export interface StatsResponse {
    success: boolean;
    data: Stats;
}

// 获取统计数据
export async function getStats(): Promise<StatsResponse> {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('获取统计数据失败');
    }

    return response.json();
}
