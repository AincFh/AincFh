// 应用配置常量
export const APP_CONFIG = {
  NAME: 'Cloudflare Blog',
  DESCRIPTION: '基于Cloudflare全栈技术的个人博客',
  AUTHOR: 'Blog Author',
  URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // SEO配置
  SEO: {
    DEFAULT_TITLE: 'Cloudflare Blog',
    DEFAULT_DESCRIPTION: '基于Cloudflare全栈技术的个人博客',
    KEYWORDS: ['blog', 'cloudflare', 'nextjs', 'typescript'],
    OG_IMAGE: '/og-image.png',
  },

  // 分页配置
  POSTS_PER_PAGE: 10,

  // 评论配置
  COMMENTS: {
    ENABLED: true,
    REQUIRE_LOGIN: true,
  },
} as const;