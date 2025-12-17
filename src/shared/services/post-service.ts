// 数据服务层 - 统一管理所有数据获取逻辑
import { apiClient } from '../utils/api-client';
import { Post, Tag, Category } from '../types/post';

// 模拟数据 - 在实际应用中应替换为真实API调用
const mockArticles: Record<string, Post> = {
  "1": {
    id: "1",
    title: "Next.js 14 新特性探索",
    slug: "nextjs-14-new-features",
    status: "published",
    authorId: "author1",
    excerpt: "Next.js 14 带来了许多令人兴奋的新特性，包括改进的性能、更好的开发体验和新的API。本文将深入探讨这些特性。",
    coverImage: "/api/placeholder/1200/600?text=Next.js+14",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    content: `# Next.js 14 新特性探索

Next.js 14 带来了许多令人兴奋的新特性，包括改进的性能、更好的开发体验和新的API。本文将深入探讨这些特性。

## 性能改进

### Turbopack

Turbopack 是 Next.js 13 中引入的新打包工具，在 Next.js 14 中得到了进一步优化。它提供了：

- **更快的开发服务器启动**：比 Webpack 快 53%
- **更快的快速刷新**：比 Webpack 快 94%
- **增量构建**：只重新构建更改的部分

### 服务器组件

服务器组件是 Next.js 13 引入的革命性功能，在 14 中得到了进一步完善：

\`\`\`tsx
// 服务器组件示例
async function BlogPost({ id }) {
  const post = await fetchPost(id);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
\`\`\`

## 新的 API

### 路由处理程序

Next.js 14 引入了路由处理程序，允许你构建 API 端点：

\`\`\`ts
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello World' });
}
\`\`\`

### 服务器操作

服务器操作允许你在客户端组件中直接调用服务器函数：

\`\`\`tsx
// 客户端组件
export default function Page() {
  async function createInvoice(formData) {
    'use server';

    const rawFormData = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
    };

    // 处理表单数据...
  }

  return (
    <form action={createInvoice}>
      <input type="text" name="customerId" />
      <input type="text" name="amount" />
      <button type="submit">Create Invoice</button>
    </form>
  );
}
\`\`\`

## 开发体验改进

### 元数据 API

元数据 API 让你更容易地管理页面的元数据：

\`\`\`tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js 14 新特性',
  description: '探索 Next.js 14 的新特性和改进',
  openGraph: {
    title: 'Next.js 14 新特性',
    description: '探索 Next.js 14 的新特性和改进',
    images: ['/og-image.jpg'],
  },
};
\`\`\`

### 部分预渲染 (PPR)

部分预渲染是 Next.js 14 的一个实验性功能，它结合了静态生成和服务器渲染的优势：

- 初始页面是静态的，加载速度快
- 动态部分在客户端渲染，提供交互性
- 无需完全重构现有应用

## 总结

Next.js 14 是一个重要的更新，它带来了许多性能改进和开发体验的提升。无论是 Turbopack 的速度提升，还是服务器组件和服务器操作的便利性，都让 Next.js 成为了构建现代 Web 应用的优秀选择。

如果你正在使用 Next.js，强烈建议升级到 14 版本并尝试这些新特性。`,
    publishedAt: new Date("2024-01-15"),
    author: {
      id: "author1",
      username: "张三",
      avatar: "https://picsum.photos/seed/author1/100/100.jpg"
    },
    categories: [{ id: "tech", name: "技术", slug: "tech", createdAt: new Date() }],
    tags: [{ id: "frontend", name: "前端", slug: "frontend", createdAt: new Date() }, { id: "nextjs", name: "Next.js", slug: "nextjs", createdAt: new Date() }, { id: "react", name: "React", slug: "react", createdAt: new Date() }]
  },
  "2": {
    id: "2",
    title: "TypeScript 高级类型技巧",
    slug: "typescript-advanced-type-tricks",
    status: "published",
    authorId: "author2",
    excerpt: "TypeScript 的类型系统非常强大，掌握一些高级类型技巧可以让你的代码更加健壮和易于维护。",
    coverImage: "/api/placeholder/1200/600?text=TypeScript",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
    content: `# TypeScript 高级类型技巧

TypeScript 的类型系统非常强大，掌握一些高级类型技巧可以让你的代码更加健壮和易于维护。

## 条件类型

条件类型允许你根据类型关系选择类型：

\`\`\`ts
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false
\`\`\`

## 映射类型

映射类型允许你创建新的类型，基于现有类型的属性：

\`\`\`ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
\`\`\`

## 模板字面量类型

TypeScript 4.1 引入了模板字面量类型：

\`\`\`ts
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

type ClickEvent = EventName<'click'>; // 'onClick'
type HoverEvent = EventName<'hover'>; // 'onHover'
\`\`\`

## 总结

TypeScript 的高级类型系统提供了强大的工具，可以帮助你编写更加类型安全的代码。掌握这些技巧将大大提高你的开发效率。`,
    publishedAt: new Date("2024-01-12"),
    author: {
      id: "author2",
      username: "李四",
      avatar: "https://picsum.photos/seed/author2/100/100.jpg"
    },
    categories: [{ id: "tech", name: "技术", slug: "tech", createdAt: new Date() }],
    tags: [{ id: "frontend", name: "前端", slug: "frontend", createdAt: new Date() }, { id: "typescript", name: "TypeScript", slug: "typescript", createdAt: new Date() }, { id: "tech", name: "技术", slug: "tech", createdAt: new Date() }]
  },
  "3": {
    id: "3",
    title: "React 性能优化最佳实践",
    slug: "react-performance-optimization",
    status: "published",
    authorId: "author3",
    excerpt: "在大型应用中，React 性能优化至关重要。本文将介绍一些常用的性能优化技巧和最佳实践。",
    coverImage: "/api/placeholder/1200/600?text=React+Performance",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    content: `# React 性能优化最佳实践

在大型应用中，React 性能优化至关重要。本文将介绍一些常用的性能优化技巧和最佳实践。

## 使用 React.memo 避免不必要的重渲染

React.memo 是一个高阶组件，它对组件进行记忆化，避免在 props 没有变化时进行不必要的重渲染：

\`\`\`tsx
const MyComponent = React.memo(function MyComponent(props) {
  /* 只在 props 变化时重新渲染 */
});
\`\`\`

## 使用 useMemo 和 useCallback

useMemo 和 useCallback 可以帮助避免在每次渲染时创建新的值或函数：

\`\`\`tsx
function ExpensiveComponent({ a, b }) {
  // 只在 a 或 b 变化时重新计算
  const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

  // 只在依赖项变化时创建新的回调
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // 空依赖数组表示回调永远不会改变

  return <div onClick={handleClick}>{expensiveValue}</div>;
}
\`\`\`

## 代码分割和懒加载

使用 React.lazy 和 Suspense 实现组件的懒加载：

\`\`\`tsx
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
\`\`\`

## 虚拟化长列表

对于长列表，使用虚拟化技术只渲染可见区域的元素：

\`\`\`tsx
import { FixedSizeList as List } from 'react-window';

function MyList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  );

  return (
    <List
      height={500}
      itemCount={items.length}
      itemSize={35}
      width={300}
    >
      {Row}
    </List>
  );
}
\`\`\`

## 总结

React 性能优化是一个综合性的工作，需要从多个方面考虑。通过合理使用 memo、useMemo、useCallback 以及代码分割等技术，可以显著提升应用的性能。`,
    publishedAt: new Date("2024-01-10"),
    author: {
      id: "author3",
      username: "王五",
      avatar: "https://picsum.photos/seed/author3/100/100.jpg"
    },
    categories: [{ id: "tech", name: "技术", slug: "tech", createdAt: new Date() }],
    tags: [{ id: "frontend", name: "前端", slug: "frontend", createdAt: new Date() }, { id: "react", name: "React", slug: "react", createdAt: new Date() }, { id: "performance", name: "性能优化", slug: "performance", createdAt: new Date() }]
  },
  "4": {
    id: "4",
    title: "现代 CSS 布局技巧",
    slug: "modern-css-layout-techniques",
    status: "published",
    authorId: "author4",
    excerpt: "CSS 布局技术在过去几年中有了长足的发展。Flexbox 和 Grid 布局让复杂的页面布局变得简单。",
    coverImage: "/api/placeholder/1200/600?text=CSS+Layout",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
    content: `# 现代 CSS 布局技巧

CSS 布局技术在过去几年中有了长足的发展。Flexbox 和 Grid 布局让复杂的页面布局变得简单。

## Flexbox 布局

Flexbox 是一维布局模型，非常适合处理行或列中的元素对齐：

\`\`\`css
.container {
  display: flex;
  justify-content: space-between; /* 主轴对齐 */
  align-items: center; /* 交叉轴对齐 */
  flex-wrap: wrap; /* 允许换行 */
}

.item {
  flex: 1; /* 占用可用空间 */
  flex-basis: 200px; /* 基础大小 */
}
\`\`\`

## Grid 布局

Grid 是二维布局模型，可以同时处理行和列：

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
}

.grid-item {
  grid-column: span 2; /* 跨越2列 */
}
\`\`\`

## 响应式设计

使用 CSS 变量和媒体查询实现响应式设计：

\`\`\`css
:root {
  --primary-color: #3498db;
  --font-size: 16px;
  --container-width: 1200px;
}

@media (max-width: 768px) {
  :root {
    --font-size: 14px;
    --container-width: 100%;
  }
}
\`\`\`

## 总结

现代 CSS 布局技术让开发者能够更轻松地创建复杂的响应式布局。掌握 Flexbox 和 Grid 是现代前端开发的必备技能。`,
    publishedAt: new Date("2024-01-08"),
    author: {
      id: "author4",
      username: "赵六",
      avatar: "https://picsum.photos/seed/author4/100/100.jpg"
    },
    categories: [{ id: "tech", name: "技术", slug: "tech", createdAt: new Date() }],
    tags: [{ id: "frontend", name: "前端", slug: "frontend", createdAt: new Date() }, { id: "css", name: "CSS", slug: "css", createdAt: new Date() }, { id: "layout", name: "布局", slug: "layout", createdAt: new Date() }]
  },
  "5": {
    id: "5",
    title: "前端工程化实践",
    slug: "frontend-engineering-practice",
    status: "published",
    authorId: "author5",
    excerpt: "前端工程化是现代 Web 开发的必备技能。本文将介绍如何构建一个高效、可维护的前端项目。",
    coverImage: "/api/placeholder/1200/600?text=Frontend+Engineering",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    content: `# 前端工程化实践

前端工程化是现代 Web 开发的必备技能。本文将介绍如何构建一个高效、可维护的前端项目。

## 构建工具选择

选择合适的构建工具是工程化的第一步：

- **Vite**: 快速的开发服务器和构建工具
- **Webpack**: 功能强大但配置复杂
- **Rollup**: 适合库的打包
- **Parcel**: 零配置的构建工具

## 代码规范

使用 ESLint 和 Prettier 保持代码风格一致：

\`\`\`json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
\`\`\`

## 自动化测试

编写单元测试和集成测试确保代码质量：

\`\`\`tsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
\`\`\`

## CI/CD 流程

设置自动化部署流程：

\`\`\`yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
\`\`\`

## 总结

前端工程化是一个系统性的工作，涉及构建工具、代码规范、测试和部署等多个方面。良好的工程化实践可以显著提高开发效率和代码质量。`,
    publishedAt: new Date("2024-01-05"),
    author: {
      id: "author5",
      username: "钱七",
      avatar: "https://picsum.photos/seed/author5/100/100.jpg"
    },
    categories: [{ id: "tech", name: "技术", slug: "tech", createdAt: new Date() }],
    tags: [{ id: "frontend", name: "前端", slug: "frontend", createdAt: new Date() }, { id: "engineering", name: "工程化", slug: "engineering", createdAt: new Date() }, { id: "tools", name: "工具", slug: "tools", createdAt: new Date() }]
  }
};

// 文章服务
export class PostService {
  // 获取所有文章列表
  static async getAllPosts(): Promise<Post[]> {
    // 在实际应用中，这里应该调用API
    // return apiClient.get<Post[]>('/posts');
    return Object.values(mockArticles);
  }

  // 获取分页文章列表
  static async getPaginatedPosts(params: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
  } = {}): Promise<{ posts: Post[], total: number, page: number, limit: number }> {
    // 在实际应用中，这里应该调用API
    // return apiClient.getPaginated<Post>('/posts', params);

    const { page = 1, limit = 10, category, tag } = params;
    let posts = Object.values(mockArticles);

    // 按分类过滤
    if (category) {
      posts = posts.filter(post => post.categories.some(cat => cat.name === category || cat.id === category || cat.slug === category));
    }

    // 按标签过滤
    if (tag) {
      posts = posts.filter(post => post.tags.some(t => t.name === tag || t.id === tag || t.slug === tag));
    }

    // 排序（按发布日期降序）
    posts.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));

    // 分页
    const total = posts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      total,
      page,
      limit
    };
  }

  // 根据ID获取单篇文章
  static async getPostById(id: string | number): Promise<Post | null> {
    // 在实际应用中，这里应该调用API
    // return apiClient.get<Post>(`/posts/${id}`);

    const post = mockArticles[String(id)];
    return post || null;
  }

  // 获取相关文章
  static async getRelatedPosts(currentPostId: string | number, limit: number = 3): Promise<Post[]> {
    // 在实际应用中，这里应该调用API
    // return apiClient.get<Post[]>(`/posts/${currentPostId}/related?limit=${limit}`);

    const currentPost = mockArticles[String(currentPostId)];
    if (!currentPost) return [];

    // 获取除当前文章外的所有文章
    const otherPosts = Object.values(mockArticles).filter(post => post.id !== currentPost.id);

    // 简单的相关性算法：按共同标签数量排序
    const postsWithScore = otherPosts.map(post => {
      const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag));
      return {
        post,
        score: commonTags.length
      };
    });

    // 按分数降序排序，然后按日期降序排序
    postsWithScore.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return (b.post.publishedAt?.getTime() || 0) - (a.post.publishedAt?.getTime() || 0);
    });

    // 返回前N篇相关文章
    return postsWithScore.slice(0, limit).map(item => item.post);
  }

  // 搜索文章
  static async searchPosts(query: string): Promise<Post[]> {
    // 在实际应用中，这里应该调用API
    // return apiClient.get<Post[]>(`/posts/search?q=${encodeURIComponent(query)}`);

    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return Object.values(mockArticles).filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      (post.excerpt?.toLowerCase().includes(lowerQuery) || false) ||
      post.content.toLowerCase().includes(lowerQuery) ||
      post.tags.some(tag =>
        tag.name.toLowerCase().includes(lowerQuery) ||
        tag.id.toLowerCase().includes(lowerQuery) ||
        tag.slug.toLowerCase().includes(lowerQuery)
      )
    );
  }

  // 获取所有分类
  static async getAllCategories(): Promise<Category[]> {
    // 在实际应用中，这里应该调用API
    // return apiClient.get<Category[]>('/categories');

    // 从文章中提取所有分类
    const categoriesMap = new Map<string, Category>();
    Object.values(mockArticles).forEach(post => {
      post.categories.forEach(category => {
        categoriesMap.set(category.id, {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: category.createdAt
        });
      });
    });

    return Array.from(categoriesMap.values());
  }

  // 获取所有标签
  static async getAllTags(): Promise<Tag[]> {
    try {
      // 在实际应用中，这里应该调用API
      // return apiClient.get<Tag[]>('/tags');

      // 从文章中提取所有标签
      const tagsMap = new Map<string, Tag>();

      Object.values(mockArticles).forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            if (tag && tag.id) {
              tagsMap.set(tag.id, tag);
            }
          });
        }
      });

      return Array.from(tagsMap.values());
    } catch (error) {
      console.error('获取所有标签时出错:', error);
      return [];
    }
  }

  // 获取热门标签
  static async getPopularTags(): Promise<{ tag: string; count: number }[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tagsMap = new Map<string, number>();
        Object.values(mockArticles).forEach(post => {
          post.tags.forEach(tag => {
            tagsMap.set(tag.id, (tagsMap.get(tag.id) || 0) + 1);
          });
        });

        const popularTags = Array.from(tagsMap.entries())
          .map(([tagId, count]) => ({
            tag: tagId,
            count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        resolve(popularTags);
      }, 200);
    });
  }
}

export default PostService;