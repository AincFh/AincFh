/**
 * 认证中间件
 * 用于验证JWT token和检查用户权限
 */

import { NextRequest } from 'next/server';
import type { JWTPayload } from '../utils/jwt';

// 在Next.js API路由中,我们通过cookies来获取token
export interface AuthContext {
  user: JWTPayload | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * 从请求中获取认证上下文
 * 注意:实际的JWT验证会在API路由中进行
 * 这里只是类型定义和辅助函数
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  // 这个函数将在API路由中实现
  // 这里只是提供类型定义
  return {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  };
}

/**
 * 验证是否为管理员
 */
export function requireAdmin(user: JWTPayload | null): void {
  if (!user) {
    throw new Error('Authentication required');
  }

  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

/**
 * 验证是否已认证
 */
export function requireAuth(user: JWTPayload | null): void {
  if (!user) {
    throw new Error('Authentication required');
  }
}

/**
 * 验证是否为资源所有者或管理员
 */
export function requireOwnerOrAdmin(user: JWTPayload | null, ownerId: number): void {
  if (!user) {
    throw new Error('Authentication required');
  }

  if (user.role !== 'admin' && user.userId !== ownerId) {
    throw new Error('Access denied');
  }
}