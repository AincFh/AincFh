# Project: A.T. Field (绝对领域)

沉浸式二次元个人网站 - 基于 Cloudflare 全家桶

## 🎯 项目进度

### ✅ 已完成

#### 1. 数据库设计
- ✅ 文章表（包含封面图、阅读量等字段）
- ✅ 番剧记录表（追番管理）
- ✅ 用户表（后台管理）
- ✅ 全文搜索功能（FTS5）

#### 2. 核心功能
- ✅ 首页：展示最新文章和追番记录
- ✅ 归档页：时间轴形式展示所有活动
- ✅ 番剧 API：增删改查功能
- ✅ 文章详情页
- ✅ 后台管理界面

#### 3. 视觉设计
- ✅ Glassmorphism 毛玻璃效果
- ✅ Framer Motion 动画
- ✅ 响应式布局
- ✅ 自定义鼠标指针
- ✅ 背景音乐播放器

#### 4. Cloudflare 集成
- ✅ D1 数据库配置
- ✅ R2 存储配置
- ✅ Pages 部署配置

### 🚧 待完成功能

1. **后台编辑器**
   - Markdown 编辑器集成
   - 图片上传到 R2
   - 番剧管理界面

2. **Live2D 看板娘**
   - 模型加载
   - 交互动画

3. **其他优化**
   - 图片懒加载
   - 代码高亮
   - SEO 优化

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
# 创建本地数据库
npx wrangler d1 create anime-db

# 执行数据库迁移
npx wrangler d1 execute anime-db --local --file=./schema.sql
```

### 3. 创建 R2 存储桶

```bash
npx wrangler r2 bucket create anime-blog-media
```

### 4. 本地开发

```bash
npm run dev
```

访问 http://localhost:5173

### 5. 部署到 Cloudflare Pages

```bash
npm run deploy
```

## 📁 项目结构

```
my-anime-blog/
├── app/
│   ├── components/
│   │   ├── anime/          # 番剧相关组件
│   │   ├── layouts/        # 布局组件
│   │   └── ui/             # UI 组件
│   ├── routes/
│   │   ├── home.tsx        # 首页
│   │   ├── archive.tsx     # 归档页
│   │   ├── articles.tsx    # 文章列表
│   │   ├── api.animes.ts   # 番剧 API
│   │   └── admin.tsx       # 后台管理
│   ├── app.css             # 全局样式
│   └── root.tsx            # 根组件
├── public/                 # 静态资源
├── schema.sql              # 数据库架构
├── wrangler.jsonc          # Cloudflare 配置
└── package.json
```

## 🎨 设计要点

### 前台（Public）
- **风格**：沉浸式、毛玻璃、视差滚动
- **配色**：深色主题 + 霓虹粉/赛博紫
- **元素**：全屏背景、动态卡片、流畅动画

### 后台（Admin）
- **风格**：清新治愈、樱花主题
- **配色**：浅色系 + 樱花粉/天空蓝
- **布局**：简洁卡片、大圆角

## 🔧 技术栈

- **框架**：React Router v7
- **样式**：Tailwind CSS
- **动画**：Framer Motion
- **数据库**：Cloudflare D1 (SQLite)
- **存储**：Cloudflare R2
- **部署**：Cloudflare Pages

## 📝 下一步

1. 运行本地开发服务器，检查页面效果
2. 在后台创建更多测试数据
3. 根据需要调整样式和布局
4. 添加 Live2D 看板娘
5. 完善后台编辑功能
6. 部署到生产环境

## 💡 提示

- 所有图片上传都应该通过 R2，然后存储 URL
- 数据库时间戳使用 Unix epoch
- API 路由返回使用 `Response.json()`
- Loader 函数直接返回对象，不需要 `json()` 包装
