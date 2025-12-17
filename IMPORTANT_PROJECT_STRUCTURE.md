# 重要：项目结构说明

## 项目概述

本项目是一个基于Next.js 15.5.2的博客系统，采用前后端分离架构，部署在Cloudflare Pages上。项目分为前台、后台和后端三个主要部分，实现了完整的博客功能，包括文章管理、评论管理、用户管理、媒体管理、分类管理、标签管理和系统设置等。

## 目录结构

```
web/
├── src/
│   ├── frontend/           # 前台前端代码
│   │   ├── components/      # 前台组件
│   │   ├── pages/          # 前台页面（使用 App Router）
│   │   ├── contexts/       # 前台上下文
│   │   ├── hooks/          # 前台自定义 hooks
│   │   └── styles/         # 前台样式
│   ├── backend/            # 后台后端代码
│   │   ├── api/            # API 路由和控制器
│   │   ├── models/          # 数据模型
│   │   ├── middleware/     # 中间件
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── admin/              # 后台前端代码
│   │   ├── components/      # 后台组件
│   │   ├── pages/          # 后台页面（使用 App Router）
│   │   ├── contexts/       # 后台上下文
│   │   ├── hooks/          # 后台自定义 hooks
│   │   └── styles/         # 后台样式
│   ├── shared/             # 共享代码
│   │   ├── components/      # 共享组件
│   │   ├── types/          # 共享类型定义
│   │   ├── utils/          # 共享工具函数
│   │   └── constants/      # 共享常量
│   ├── app/                # Next.js App Router 根目录
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 前台首页
│   │   ├── api/             # API 路由入口
│   │   │   ├── frontend/    # 前台 API 路由
│   │   │   └── admin/       # 后台 API 路由
│   │   ├── admin/           # 后台路由入口
│   │   └── [...frontend]    # 前台路由入口
│   └── lib/                # 第三方库配置和工具
├── public/                 # 静态资源
├── db/                     # 数据库相关文件
└── ...                     # 配置文件
```

## 目录说明

### 1. src/frontend/

前台前端代码目录，包含了博客前台网站的所有代码，包括：

- **components/**：前台使用的React组件
- **pages/**：前台页面，使用Next.js App Router架构
- **contexts/**：前台使用的React上下文，用于状态管理
- **hooks/**：前台使用的自定义React hooks
- **styles/**：前台样式文件

### 2. src/backend/

后台后端代码目录，包含了博客系统的后端API和业务逻辑，包括：

- **api/**：API路由和控制器，处理HTTP请求
- **models/**：数据模型，定义数据库表结构
- **middleware/**：中间件，用于处理认证、授权等横切关注点
- **services/**：业务逻辑层，处理核心业务逻辑
- **utils/**：工具函数，提供通用功能

### 3. src/admin/

后台前端代码目录，包含了博客后台管理系统的所有代码，包括：

- **components/**：后台使用的React组件
- **pages/**：后台页面，使用Next.js App Router架构
- **contexts/**：后台使用的React上下文，用于状态管理
- **hooks/**：后台使用的自定义React hooks
- **styles/**：后台样式文件

### 4. src/shared/

共享代码目录，包含了前台和后台共同使用的代码，包括：

- **components/**：共享的React组件
- **types/**：共享的TypeScript类型定义
- **utils/**：共享的工具函数
- **constants/**：共享的常量

### 5. src/app/

Next.js App Router根目录，包含了应用的根布局和路由入口，包括：

- **layout.tsx**：应用的根布局
- **page.tsx**：前台首页
- **api/**：API路由入口，分为前台和后台API
- **admin/**：后台路由入口
- **[...frontend]**：前台路由入口，使用动态路由匹配所有前台页面

### 6. src/lib/

第三方库配置和工具目录，包含了第三方库的配置和封装，例如数据库连接、API客户端等。

### 7. public/

静态资源目录，包含了应用使用的静态文件，例如图片、图标、字体等。

### 8. db/

数据库相关文件目录，包含了数据库迁移脚本和种子数据等。

## 技术栈

- **前端框架**：Next.js 15.5.2（App Router）
- **开发语言**：TypeScript
- **样式方案**：Tailwind CSS
- **状态管理**：React Context API
- **动画效果**：Framer Motion
- **图标库**：Lucide React
- **后端**：Cloudflare Pages Functions
- **数据库**：Cloudflare D1
- **部署平台**：Cloudflare Pages

## 开发流程

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 构建生产版本

```bash
npm run build
```

### 3. 运行生产版本

```bash
npm start
```

### 4. 代码检查

```bash
npm run lint
npm run typecheck
```

## 重要文件和配置

### 1. package.json

项目的依赖配置文件，包含了项目的脚本命令和依赖包信息。

### 2. next.config.js

Next.js的配置文件，包含了项目的构建配置和插件配置。

### 3. tsconfig.json

TypeScript的配置文件，包含了项目的TypeScript编译配置。

### 4. cloudflare.json

Cloudflare Pages的配置文件，包含了项目的部署配置。

### 5. wrangler.toml

Cloudflare Wrangler的配置文件，用于本地开发和部署。

## 代码规范

1. **文件命名**：使用kebab-case命名方式，例如：`article-card.tsx`
2. **组件命名**：使用PascalCase命名方式，例如：`ArticleCard`
3. **变量命名**：使用camelCase命名方式，例如：`articleTitle`
4. **类型命名**：使用PascalCase命名方式，例如：`ArticleType`
5. **常量命名**：使用UPPER_SNAKE_CASE命名方式，例如：`API_URL`

## 路径分类规划重要通知

### 1. 严格的路径使用规则

**核心原则：代码必须放在正确的目录中，禁止跨目录引用！**

| 代码类型 | 必须存放目录 | 禁止存放目录 |
|---------|-------------|-------------|
| 前台组件 | `src/frontend/components/` | `src/admin/`、`src/backend/` |
| 后台组件 | `src/admin/components/` | `src/frontend/`、`src/backend/` |
| 共享组件 | `src/shared/components/` | 其他任何目录 |
| 前台业务逻辑 | `src/frontend/` | `src/admin/`、`src/backend/` |
| 后台业务逻辑 | `src/admin/` | `src/frontend/`、`src/backend/` |
| API路由 | `src/app/api/` | 其他任何目录 |
| 后端服务 | `src/backend/` | `src/frontend/`、`src/admin/` |
| 共享工具 | `src/shared/utils/` | 其他任何目录 |

### 2. 路径使用最佳实践

#### 2.1 组件路径规划
- **前台组件**：仅用于网站面向普通用户的界面
- **后台组件**：仅用于管理员后台界面
- **共享组件**：仅用于同时被前台和后台使用的通用组件（如按钮、输入框、加载动画等）
- **UI组件库**：所有基础UI组件必须放在`src/shared/components/ui/`目录下

#### 2.2 API路径规划
- **前台API**：`src/app/api/frontend/` - 仅用于前台页面调用的公共API
- **后台API**：`src/app/api/admin/` - 仅用于后台页面调用的私有API，需要认证
- **AI API**：`src/app/api/ai/` - 用于AI相关功能的API

#### 2.3 数据模型路径规划
- **前台模型**：`src/frontend/types/` - 前台使用的数据类型
- **后台模型**：`src/admin/types/` - 后台使用的数据类型
- **共享模型**：`src/shared/types/` - 前后台共享的数据类型
- **数据库模型**：`src/backend/models/` - 与数据库直接交互的数据模型

### 3. 禁止的路径使用行为

❌ **绝对禁止**：前台代码引用后台代码
❌ **绝对禁止**：后台代码引用前台代码
❌ **绝对禁止**：将共享代码放在非共享目录
❌ **绝对禁止**：将业务逻辑放在API路由中
❌ **绝对禁止**：将组件放在页面目录中
❌ **绝对禁止**：将样式文件放在组件目录外

### 4. 路径使用检查清单

在提交代码前，请检查：

✅ 所有新文件都放在了正确的目录中
✅ 没有跨目录的非法引用
✅ 组件、页面、API都遵循了路径规划
✅ 共享代码都放在了`src/shared/`目录下
✅ 类型定义放在了正确的`types/`目录中

### 5. 常见路径错误及修正方法

| 错误情况 | 正确做法 |
|---------|---------|
| 前台组件放在了`src/components/` | 移动到`src/frontend/components/` |
| 后台组件放在了`src/components/` | 移动到`src/admin/components/` |
| 共享组件放在了`src/frontend/components/` | 移动到`src/shared/components/` |
| API路由放在了`src/backend/api/` | 移动到`src/app/api/` |
| 类型定义放在了组件目录中 | 移动到对应的`types/`目录中 |

## 注意事项

1. 所有代码必须通过TypeScript类型检查
2. 所有代码必须通过ESLint检查
3. 前台和后台代码必须严格分离，不得相互引用
4. 共享代码必须放在`src/shared/`目录下
5. API路由必须按照前台和后台分离，分别放在`src/app/api/frontend/`和`src/app/api/admin/`目录下
6. 所有页面必须使用Next.js App Router架构
7. 严格遵循上述路径分类规划，违反者将导致构建失败

## 后续优化建议

1. 增加单元测试和集成测试
2. 优化性能，减少页面加载时间
3. 增加国际化支持
4. 优化SEO
5. 增加更多的自动化测试

## 联系方式

如果您在使用过程中遇到问题，请联系项目管理员或查看项目文档。

---

**重要提示**：在操作本项目之前，请务必仔细阅读本文件，了解项目的目录结构和开发流程。