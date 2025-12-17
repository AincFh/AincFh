# 项目目录结构说明

本项目采用前后端分离、前后台分离的架构设计，目录结构如下：

## 前端部分

### `/src/frontend/`
前端用户界面相关代码

- `pages/` - 页面组件
- `components/` - 可复用的UI组件
- `hooks/` - 自定义React Hooks
- `utils/` - 工具函数
- `styles/` - 样式文件
- `assets/` - 静态资源（图片、字体等）

### `/src/admin/`
管理后台界面相关代码

- `pages/` - 后台页面组件
- `components/` - 后台可复用的UI组件
- `hooks/` - 后台自定义React Hooks
- `utils/` - 后台工具函数
- `styles/` - 后台样式文件
- `assets/` - 后台静态资源

## 后端部分

### `/src/app/api/`
前台后端API路由（Cloudflare Pages Functions）

- `auth/` - 认证相关接口（登录、注册、登出等）
- `posts/` - 文章相关接口
- `categories/` - 分类相关接口
- `tags/` - 标签相关接口
- `ai/` - AI助手相关接口
- `search/` - 搜索相关接口

### `/src/backend/`
后台管理系统后端代码

- `api/` - API接口定义
- `routes/` - 路由配置
- `models/` - 数据模型
- `controllers/` - 控制器
- `services/` - 业务逻辑服务
- `middleware/` - 中间件
- `utils/` - 后端工具函数
- `config/` - 配置文件

### `/db/`
数据库相关文件（项目根目录）

- `migrations/` - D1数据库迁移SQL文件

### `/src/lib/`
共享库代码（前后端共用）

- `d1.ts` - D1数据库适配器
- `kv.ts` - KV缓存工具
- `auth.ts` - 认证与会话管理
- `ai/` - AI相关工具函数

## 共享部分

### `/src/shared/`
前后端共享的代码

- `types/` - TypeScript类型定义
- `constants/` - 常量定义
- `utils/` - 通用工具函数
- `hooks/` - 通用Hooks

## 传统目录

### `/src/app/`
Next.js App Router目录（保留，但逐步迁移到新结构）

### `/src/components/`
现有组件（将逐步迁移到frontend或admin目录）

### `/src/styles/`
全局样式文件

## 迁移计划

1. 将现有页面组件迁移到`/src/frontend/pages/`
2. 将现有组件按用途迁移到`/src/frontend/components/`或`/src/admin/components/`
3. 将共享类型和工具函数迁移到`/src/shared/`
4. 逐步实现后端API结构

## 注意事项

- 新功能开发请按照新的目录结构进行
- 现有代码迁移时请注意保持功能完整性
- 前后台组件请明确区分，避免混淆