// 认证工具 - 用于Cloudflare Pages Functions

// 导入Cloudflare Pages Functions类型
declare global {
  namespace CloudflareWorkers {
    interface Env {
      // 认证相关环境变量
      AUTH_SECRET: string;
      TURNSTILE_SECRET_KEY: string;
    }
  }
}

// 用户会话接口
export interface UserSession {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  createdAt: number;
  expiresAt: number;
}

// 认证结果接口
export interface AuthResult {
  success: boolean;
  user?: UserSession;
  error?: string;
}

/**
 * 验证Turnstile响应
 * @param token Turnstile token
 * @param secretKey Turnstile secret key
 * @param ip 用户IP地址
 * @returns 验证结果
 */
export async function verifyTurnstile(
  token: string,
  secretKey: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    if (ip) {
      formData.append('remoteip', ip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result['error-codes']?.join(', ') || 'Invalid Turnstile token'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return {
      success: false,
      error: 'Failed to verify Turnstile token'
    };
  }
}

/**
 * 从请求中获取用户会话
 * @param request Request对象
 * @returns 用户会话或null
 */
export async function getSession(request: Request): Promise<UserSession | null> {
  try {
    // 在Cloudflare Pages Functions中，我们依赖Worker KV或Cookie来存储会话信息
    // 这里使用简化的实现，实际生产环境中可能需要更复杂的逻辑
    const cookies = request.headers.get('Cookie');

    if (!cookies) {
      return null;
    }

    // 从cookies中提取会话ID（实际实现需要解析cookies）
    // 注意：这是一个简化的实现，真实环境中应该使用更安全的cookie解析方式
    const sessionMatch = cookies.match(/session=([^;]+)/);

    if (!sessionMatch) {
      return null;
    }

    // 这里应该从KV存储中获取会话数据
    // 简化实现：返回模拟的会话数据
    // 在生产环境中，应该从KV存储或其他持久化存储中检索会话

    // 模拟检查会话有效性
    // 实际实现中，应该验证会话ID并从存储中获取真实的用户数据
    return {
      id: '1',
      email: 'user@example.com',
      name: 'Example User',
      role: 'user',
      createdAt: Date.now() - 3600000,
      expiresAt: Date.now() + 7200000
    };
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
}

/**
 * 验证用户是否已认证
 * @param request Request对象
 * @returns 认证结果
 */
export async function isAuthenticated(request: Request): Promise<AuthResult> {
  const session = await getSession(request);

  if (!session) {
    return {
      success: false,
      error: 'Not authenticated'
    };
  }

  // 检查会话是否过期
  if (session.expiresAt < Date.now()) {
    return {
      success: false,
      error: 'Session expired'
    };
  }

  return {
    success: true,
    user: session
  };
}

/**
 * 验证用户是否有管理员权限
 * @param request Request对象
 * @returns 认证结果
 */
export async function isAdmin(request: Request): Promise<AuthResult> {
  const authResult = await isAuthenticated(request);

  if (!authResult.success) {
    return authResult;
  }

  if (!authResult.user || authResult.user.role !== 'admin') {
    return {
      success: false,
      error: 'Admin access required'
    };
  }

  return authResult;
}

/**
 * 创建HttpOnly Cookie
 * @param name Cookie名称
 * @param value Cookie值
 * @param options Cookie选项
 * @returns Cookie字符串
 */
export function createHttpOnlyCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): string {
  const { maxAge, path = '/', domain, secure = true, sameSite = 'strict' } = options;

  let cookie = `${name}=${value}; HttpOnly`;

  if (maxAge !== undefined) {
    cookie += `; Max-Age=${maxAge}`;
  }

  cookie += `; Path=${path}`;

  if (domain) {
    cookie += `; Domain=${domain}`;
  }

  if (secure) {
    cookie += '; Secure';
  }

  cookie += `; SameSite=${sameSite}`;

  return cookie;
}

/**
 * 清除认证Cookie
 * @param name Cookie名称
 * @param options Cookie选项
 * @returns 清除Cookie的字符串
 */
export function clearCookie(
  name: string,
  options: {
    path?: string;
    domain?: string;
  } = {}
): string {
  return createHttpOnlyCookie(name, '', {
    ...options,
    maxAge: 0
  });
}