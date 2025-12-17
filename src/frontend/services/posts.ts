// 前端 API 服务层 - 文章管理
import { getAuthToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    cover_image_url?: string;
    author_id: number;
    category_id?: number;
    status: 'draft' | 'published' | 'archived';
    view_count: number;
    created_at: number;
    updated_at: number;
}

export interface PostsResponse {
    success: boolean;
    data: Post[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PostResponse {
    success: boolean;
    data: Post;
}

// 获取文章列表
export async function getPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}): Promise<PostsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const response = await fetch(`${API_BASE}/admin/posts?${query.toString()}`);

    if (!response.ok) {
        throw new Error('获取文章列表失败');
    }

    return response.json();
}

// 获取单篇文章
export async function getPost(id: number): Promise<PostResponse> {
    const response = await fetch(`${API_BASE}/admin/posts/${id}`);

    if (!response.ok) {
        throw new Error('获取文章失败');
    }

    return response.json();
}

// 创建文章
export async function createPost(data: Partial<Post>): Promise<PostResponse> {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE}/admin/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '创建文章失败');
    }

    return response.json();
}

// 更新文章
export async function updatePost(id: number, data: Partial<Post>): Promise<PostResponse> {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE}/admin/posts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '更新文章失败');
    }

    return response.json();
}

// 删除文章
export async function deletePost(id: number): Promise<void> {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE}/admin/posts/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '删除文章失败');
    }
}
