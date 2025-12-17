// 前端 API 服务层 - 认证相关
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    data: {
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
            avatar_url?: string;
        };
        token: string;
    };
}

interface UserResponse {
    success: boolean;
    data: {
        id: number;
        email: string;
        name: string;
        role: string;
        avatar_url?: string;
        bio?: string;
        created_at: number;
    };
}

// 登录
export async function login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/admin/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '登录失败');
    }

    const result = await response.json();

    // 保存 Token 到 Cookie
    if (result.data?.token) {
        setCookie('auth_token', result.data.token, {
            maxAge: 7 * 24 * 60 * 60, // 7天
            path: '/',
        });
    }

    return result;
}

// 登出
export async function logout(): Promise<void> {
    const token = getCookie('auth_token');

    if (token) {
        try {
            await fetch(`${API_BASE}/admin/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // 清除 Cookie
    deleteCookie('auth_token');

    // 清除 localStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
    }
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<UserResponse> {
    const token = getCookie('auth_token');

    if (!token) {
        throw new Error('未登录');
    }

    const response = await fetch(`${API_BASE}/admin/auth/me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '获取用户信息失败');
    }

    return response.json();
}

// 获取 Token
export function getAuthToken(): string | undefined {
    return getCookie('auth_token') as string | undefined;
}

// 检查是否已登录
export function isAuthenticated(): boolean {
    return !!getCookie('auth_token');
}
