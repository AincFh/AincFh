// HTTP响应和错误处理工具 - 用于Cloudflare Pages Functions

// HTTP状态码常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, any>;
}

// 成功响应助手函数
export function successResponse<T = any>(
  data?: T,
  status: number = HTTP_STATUS.OK,
  options?: ResponseInit
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options
  });
}

// 错误响应助手函数
export function errorResponse(
  error: string,
  status: number = HTTP_STATUS.BAD_REQUEST,
  options?: ResponseInit
): Response {
  const response: ApiResponse = {
    success: false,
    error
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options
  });
}

// 验证错误响应助手函数
export function validationErrorResponse(
  errors: Record<string, string[] | string>,
  status: number = HTTP_STATUS.UNPROCESSABLE_ENTITY,
  options?: ResponseInit
): Response {
  const response: ApiResponse = {
    success: false,
    error: 'Validation failed',
    data: errors
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options
  });
}

// 处理请求参数助手函数
export async function getRequestParams(request: Request): Promise<Record<string, any>> {
  const contentType = request.headers.get('Content-Type');

  if (contentType?.includes('application/json')) {
    try {
      return await request.json();
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  } else if (contentType?.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const params: Record<string, any> = {};

    formData.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  return {};
}

// 分页响应助手函数
export function paginatedResponse<T = any>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  status: number = HTTP_STATUS.OK,
  options?: ResponseInit
): Response {
  const totalPages = Math.ceil(total / pageSize);
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options
  });
}

// 获取请求中的查询参数助手函数
export function getQueryParams(request: Request): URLSearchParams {
  const url = new URL(request.url);
  return url.searchParams;
}

// 获取请求头助手函数
export function getRequestHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}