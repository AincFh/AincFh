# 修复 Cloudflare Pages 404 错误 - 快速指南

## 📋 已完成的修复

✅ 创建 `public/_routes.json` - Cloudflare Pages 路由配置
✅ 更新 `next.config.js` - 添加 Cloudflare 优化设置
✅ 测试本地构建 - 构建成功 ✓

## 🚀 重新部署步骤

### 方案 1: Git 自动部署 (推荐,最简单)

在 PowerShell 中执行:

```powershell
# 1. 提交新配置
git add .
git commit -m "修复 Cloudflare Pages 路由配置"
git push origin master

# 2. 等待几分钟,Cloudflare 会自动检测并重新部署
```

### 方案 2: 手动部署 (如果 Git 出现问题)

```powershell
# 1. 构建项目
npm run build

# 2. 部署
npx wrangler pages deploy .next --project-name=blog-web
```

## ⚙️ Cloudflare Pages 设置 (重要!)

### 构建配置

访问: [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → blog-web → Settings → Builds & deployments

**必须配置:**
- **构建命令**: `npm run build`
- **构建输出目录**: `.next`
- **Node 版本**: 18 或更高

### 函数绑定 (必需,否则 API 不工作)

访问: Settings → Functions → Bindings

**添加 D1 数据库绑定:**
- Variable name: `DB`
- D1 database: 选择 `blog-database`

**添加 KV 绑定:**
- Variable name: `KV_SESSIONS`
- KV namespace: 选择您的 KV (ID: 370ad8b37672482ebd31f532726d7964)

### 环境变量 (可选)

访问: Settings → Environment variables

```
AUTH_SECRET=<运行: openssl rand -hex 32>
```

## ✅ 验证部署

部署完成后访问:
- 主域名: https://aincfh.dpdns.org
- Pages 域名: https://blog-web-48w.pages.dev
- 最新部署: https://master.blog-web-48w.pages.dev

## ❓ 如果还是 404

1. **清除浏览器缓存** - Ctrl + Shift + Delete
2. **检查构建日志** - Dashboard → Deployments → 点击最新部署 → View build logs
3. **等待几分钟** - CDN 缓存可能需要时间刷新
4. **检查绑定** - 确认 D1 和 KV 已正确绑定

## 📝 关键文件变更

- **public/_routes.json**: 新建,定义 Cloudflare Pages 路由规则
- **next.config.js**: 添加 `skipTrailingSlashRedirect` 和 `assetPrefix` 配置

## 💡 提示

如果您看到构建成功但访问仍然 404,最可能的原因是:
- ❌ 构建输出目录配置错误 (应该是 `.next`)
- ❌ 缺少 D1/KV 绑定
- ❌ 浏览器缓存了旧的 404 页面
