# Cloudflare 部署指南

本文档提供了将博客应用部署到 Cloudflare Pages 的详细步骤和配置说明。

## 环境准备

### 前置条件

1. 安装 Wrangler CLI
   ```bash
   npm install -g wrangler
   ```

2. 登录 Cloudflare 账户
   ```bash
   wrangler login
   ```

3. 创建 Cloudflare Pages 项目
   - 访问 `https://dash.cloudflare.com/`
   - 选择 "Pages" -> "Create a project" -> "Connect to Git"
   - 选择你的 GitHub/GitLab 仓库

## 数据库配置

### 创建 D1 数据库

```bash
# 创建开发数据库
wrangler d1 create blog-database

# 应用数据库迁移
wrangler d1 execute blog-database --local --file=./db/migrations/0001_initial_schema.sql

# 为生产环境执行迁移
wrangler d1 execute blog-database --remote --file=./db/migrations/0001_initial_schema.sql
```

### 更新数据库 ID

在部署前，需要更新以下文件中的数据库 ID：

1. `wrangler.toml` - 更新 `database_id` 字段

## KV 存储配置

### 创建 KV 命名空间

```bash
# 创建 KV 命名空间
wrangler kv:namespace create "KV_SESSIONS"

# 创建预览环境的 KV 命名空间
wrangler kv:namespace create "KV_SESSIONS" --preview
```

### 更新 KV 命名空间 ID

在部署前，需要更新以下文件中的 KV 命名空间 ID：

1. `wrangler.toml` - 更新 `id` 字段

## 环境变量配置

在 Cloudflare Pages 项目设置中配置以下环境变量：

### 必需环境变量

- `AUTH_SECRET`: 用于 JWT 签名和认证的密钥
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile 的密钥
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile 的站点密钥
- `DATABASE_ID`: D1 数据库 ID
- `KV_NAMESPACE_ID`: KV 命名空间 ID
- `KV_NAMESPACE_ID_PREVIEW`: 预览环境的 KV 命名空间 ID
- `ACCOUNT_ID`: Cloudflare 账户 ID
- `ZONE_ID`: Cloudflare 区域 ID

### 如何生成 AUTH_SECRET

```bash
openssl rand -hex 32
```

## 部署流程

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev
```

### 构建项目

```bash
# 构建项目
npm run build
```

### 部署到 Cloudflare

#### 手动部署

```bash
# 清理缓存目录（避免部署失败）
rm -rf .next/cache

# 使用 Wrangler 部署
npx wrangler pages deploy .next --project-name=blog-web
```

#### 自动部署（推荐）

1. 将代码推送到配置的分支（main 分支用于生产环境）
2. Cloudflare Pages 会自动触发构建和部署

## 数据库迁移管理

### 创建新的迁移

1. 在 `db/migrations/` 目录下创建新的 SQL 文件，文件名格式为 `{版本号}_{描述}.sql`
2. 编写 SQL 迁移语句
3. 执行迁移

```bash
# 执行新的迁移
wrangler d1 execute blog-database --remote --file=./db/migrations/{新的迁移文件}.sql
```

## 常见问题排查

### 构建失败

- 检查 Node.js 版本是否兼容（推荐使用 Node.js 18+）
- 确认所有依赖已正确安装
- 检查环境变量是否配置正确

### 部署失败 - 文件大小超过限制

- 确保在部署前清理了缓存目录：`rm -rf .next/cache`
- 检查是否有大型文件被意外包含在构建输出中

### API 路由问题

- 确认 API 路由遵循 Next.js Edge Runtime 的限制
- 检查 Cloudflare Pages Functions 是否启用
- 验证 HTTP 响应头设置是否正确

### 数据库连接失败

- 确认 D1 数据库 ID 是否正确配置
- 检查数据库迁移是否成功执行
- 验证代码中的数据库绑定名称是否与配置一致

## 性能优化

### 缓存策略

- 为静态资源配置适当的缓存头
- 使用 Cloudflare 的 Edge Cache 功能加速页面加载

### 资源优化

- 优化图片和静态资源
- 启用 Next.js 的静态生成和增量静态再生成功能

## 安全配置

### 启用 HTTPS
- Cloudflare Pages 默认提供 HTTPS

### 配置 CORS
- 已在代码中配置了基本的 CORS 设置
- 根据需要调整 `Access-Control-Allow-Origin` 策略

### 启用 Turnstile
- 确保已配置 Turnstile 密钥
- 在前端表单中集成 Turnstile 挑战

## 监控和日志

- 访问 Cloudflare Dashboard 查看部署历史和构建日志
- 使用 Cloudflare Analytics 监控页面访问和性能
- 配置日志推送以便更深入地分析应用行为

## Windows 系统注意事项

- 在 Windows 系统上，使用 PowerShell 或 WSL 执行命令
- 清理缓存目录的命令：`Remove-Item -Recurse -Force .next/cache`
- 注意命令分隔符的差异：使用 `;` 而不是 `&&` 在 PowerShell 中
- @cloudflare/next-on-pages 工具在 Windows 系统上可能存在兼容性问题，建议使用 WSL 或直接部署 .next 目录

## 配置文件说明

### wrangler.toml

```toml
# Cloudflare Pages 配置文件
# 用于配置 D1 数据库和 KV 存储绑定

name = "blog-web"
compatibility_date = "2024-01-01"

# Pages 构建输出目录
pages_build_output_dir = ".next"

# D1 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "blog-database"
database_id = "YOUR_DATABASE_ID"

# KV 存储绑定 (用于会话管理等)
[[kv_namespaces]]
binding = "KV_SESSIONS"
id = "YOUR_KV_NAMESPACE_ID"
```

## 部署命令说明

| 命令 | 描述 |
|------|------|
| `npm run build` | 构建 Next.js 应用 |
| `npx wrangler pages deploy .next --project-name=blog-web` | 部署应用到 Cloudflare Pages |
| `rm -rf .next/cache` | 清理缓存目录（Linux/macOS） |
| `Remove-Item -Recurse -Force .next/cache` | 清理缓存目录（Windows） |

## 部署成功后的访问

部署成功后，你可以通过以下 URL 访问你的应用：
- 临时部署 URL：`https://{DEPLOYMENT_ID}.{PROJECT_NAME}.pages.dev`
- 主分支别名 URL：`https://master.{PROJECT_NAME}.pages.dev`

## 最佳实践

1. 定期清理缓存目录，避免部署失败
2. 使用环境变量管理敏感信息
3. 启用 Cloudflare Analytics 监控应用性能
4. 定期备份数据库
5. 测试部署前的构建过程
6. 使用分支部署进行预览和测试
7. 配置适当的缓存策略
8. 监控应用日志和错误信息

## 故障排除流程

1. 检查构建日志，查找错误信息
2. 验证环境变量配置是否正确
3. 检查数据库和 KV 存储绑定是否正确
4. 确认构建输出目录结构是否正确
5. 尝试清理缓存目录并重新部署
6. 检查 Cloudflare Dashboard 中的错误信息
7. 查看应用日志和监控数据
8. 尝试在本地重现问题

通过遵循本指南，你应该能够成功部署和管理你的 Next.js 博客应用到 Cloudflare Pages。