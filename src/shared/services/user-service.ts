// 用户服务 - 统一管理用户相关数据获取逻辑
import { apiClient } from '../utils/api-client';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  // 扩展用户资料字段
  website?: string;
  location?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

// 用户服务
export class UserService {
  // 获取当前用户资料
  static async getCurrentUserProfile(): Promise<UserProfile> {
    // 在实际应用中，这里应该调用API
    // return apiClient.get<UserProfile>('/users/profile');

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 模拟用户数据
    return {
      id: "1",
      username: "johndoe",
      email: "john@example.com",
      avatar: "https://picsum.photos/seed/user-avatar/200/200.jpg",
      bio: "前端开发者，热爱React和Next.js。专注于构建高性能、用户友好的Web应用。",
      role: "user",
      website: "https://johndoe.dev",
      location: "北京",
      socialLinks: {
        github: "https://github.com/johndoe",
        twitter: "https://twitter.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe"
      },
      createdAt: "2023-01-15T08:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z"
    };
  }

  // 更新用户资料
  static async updateUserProfile(data: UserUpdateData): Promise<UserProfile> {
    // 在实际应用中，这里应该调用API
    // return apiClient.put<UserProfile>('/users/profile', data);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 获取当前用户资料
    const currentUser = await this.getCurrentUserProfile();

    // 合并更新数据
    const updatedUser: UserProfile = {
      ...currentUser,
      ...data,
      updatedAt: new Date().toISOString()
    };

    return updatedUser;
  }

  // 获取用户公开信息
  static async getUserPublicProfile(userId: string): Promise<Omit<UserProfile, 'email' | 'role'>> {
    // 在实际应用中，这里应该调用API
    // return apiClient.get<Omit<UserProfile, 'email' | 'role'>>(`/users/${userId}`);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 模拟用户数据（不包含敏感信息）
    return {
      id: userId,
      username: "johndoe",
      avatar: "https://picsum.photos/seed/user-avatar/200/200.jpg",
      bio: "前端开发者，热爱React和Next.js。专注于构建高性能、用户友好的Web应用。",
      website: "https://johndoe.dev",
      location: "北京",
      socialLinks: {
        github: "https://github.com/johndoe",
        twitter: "https://twitter.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe"
      },
      createdAt: "2023-01-15T08:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z"
    };
  }

  // 上传头像
  static async uploadAvatar(file: File): Promise<{ url: string }> {
    // 在实际应用中，这里应该调用API
    // const formData = new FormData();
    // formData.append('avatar', file);
    // return apiClient.post<{ url: string }>('/users/avatar', formData);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟上传成功，返回随机图片URL
    const randomSeed = Math.random().toString(36).substring(2, 15);
    return {
      url: `https://picsum.photos/seed/${randomSeed}/200/200.jpg`
    };
  }

  // 更改密码
  static async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    // 在实际应用中，这里应该调用API
    // return apiClient.post<{ success: boolean }>('/users/change-password', {
    //   currentPassword,
    //   newPassword
    // });

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟密码更改成功
    return { success: true };
  }

  // 删除账户
  static async deleteAccount(password: string): Promise<{ success: boolean }> {
    // 在实际应用中，这里应该调用API
    // return apiClient.delete<{ success: boolean }>('/users/account', {
    //   data: { password }
    // });

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    // 模拟账户删除成功
    return { success: true };
  }

  // 获取用户活动历史
  static async getUserActivityHistory(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    activities: Array<{
      id: string;
      type: 'post' | 'comment' | 'like' | 'follow';
      target: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    // 在实际应用中，这里应该调用API
    // return apiClient.getPaginated('/users/activity', params);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 400));

    const { page = 1, limit = 10 } = params;

    // 模拟活动数据
    const activities = [
      {
        id: "1",
        type: "post" as const,
        target: "Next.js 14 新特性探索",
        createdAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "2",
        type: "comment" as const,
        target: "TypeScript 高级类型技巧",
        createdAt: "2024-01-14T15:20:00Z"
      },
      {
        id: "3",
        type: "like" as const,
        target: "React 性能优化最佳实践",
        createdAt: "2024-01-13T09:45:00Z"
      },
      {
        id: "4",
        type: "follow" as const,
        target: "用户 张三",
        createdAt: "2024-01-12T18:10:00Z"
      },
      {
        id: "5",
        type: "post" as const,
        target: "现代 CSS 布局技巧",
        createdAt: "2024-01-10T14:25:00Z"
      }
    ];

    // 分页
    const total = activities.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    return {
      activities: paginatedActivities,
      total,
      page,
      limit
    };
  }
}

export default UserService;