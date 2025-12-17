// API相关常量 - Cloudflare Pages Functions版
export const API_ENDPOINTS = {
  // 用户认证相关 (Cloudflare Pages Functions)
  USER_LOGIN: '/api/auth/login',
  USER_REGISTER: '/api/auth/register',
  USER_LOGOUT: '/api/auth/logout',
  USER_PROFILE: '/api/auth/me',
  USER_UPDATE: '/api/auth/me',

  // 文章相关 (Cloudflare Pages Functions)
  POSTS: '/api/posts',
  POST_DETAIL: (id: string) => `/api/posts/${id}`,
  POST_CREATE: '/api/posts',
  POST_UPDATE: (id: string) => `/api/posts/${id}`,
  POST_DELETE: (id: string) => `/api/posts/${id}`,

  // 分类和标签 (Cloudflare Pages Functions)
  CATEGORIES: '/api/categories',
  TAGS: '/api/tags',

  // 评论相关 (Cloudflare Pages Functions)
  COMMENTS: (postId: string) => `/api/posts/${postId}/comments`,
  COMMENT_CREATE: (postId: string) => `/api/posts/${postId}/comments`,

  // AI助手相关 (Cloudflare Pages Functions)
  AI_QUERY: '/api/ai/query',
  AI_SESSION: '/api/ai/session',

  // 搜索相关 (Cloudflare Pages Functions)
  SEARCH: '/api/search',
} as const;

// 分页相关常量
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;