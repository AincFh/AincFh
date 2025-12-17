import { ApiResponse, PaginatedResponse } from '../types';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Cloudflare使用HttpOnly Cookie认证，不再需要手动添加Authorization头
    // 跨域请求需要确保credentials设置为include以允许Cookie传递

    const config: RequestInit = {
      ...options,
      credentials: 'include', // 确保跨域请求包含Cookie
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // 如果响应状态码不在200-299范围内，抛出错误
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `请求失败: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 分页请求
  async getPaginated<T>(endpoint: string, params?: {
    page?: number;
    limit?: number;
    [key: string]: any;
  }): Promise<PaginatedResponse<T>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const urlWithQuery = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.get<PaginatedResponse<T>>(urlWithQuery);
  }
}

// 创建默认API客户端实例
export const apiClient = new ApiClient();

// 导出API客户端类
export { ApiClient };