# Cloudflare Pages 动态部署 - 完整配置

## 🚀 Cloudflare Pages 构建设置

访问: **Cloudflare Dashboard → Pages → blog-web → Settings → Builds & deployments**

### 生产环境配置

点击 "Edit configuration" 或 "配置生产部署"，设置：

**框架预设**: `Next.js`

**构建命令**:
```bash
npx @cloudflare/next-on-pages@1
```

**构建输出目录**:
```
.vercel/output/static
```

**根目录**: (留空)

**环境变量** (Build environment variables):
```
NODE_VERSION=18
```

### 函数绑定 (必须配置!)

访问: **Settings → Functions → Bindings**

**添加 D1 数据库绑定**:
- Variable name: `DB`
- D1 database: 选择 `blog-database`

**添加 KV 命名空间绑定**:
- Variable name: `KV_SESSIONS`
- KV namespace: 选择您的 KV (blog)

### 环境变量 (运行时)

访问: **Settings → Environment variables**

添加生产环境变量:
```
AUTH_SECRET=<运行 openssl rand -hex 32 生成>
```

## 🔧 本地代码配置

我现在会帮您：
1. ✅ 确保 `next.config.js` 配置正确
2. ✅ 创建 `.node-version` 文件
3. ✅ 提交代码

## 📋 完成配置后

1. 保存 Cloudflare Pages 设置
2. 触发重新部署（自动或手动）
3. 等待 3-5 分钟
4. 访问 https://aincfh.dpdns.org

## ⚠️ 可能遇到的问题

如果构建失败，查看构建日志中的错误信息：
- 如果提示找不到模块 → 检查 `package.json` 依赖
- 如果提示权限问题 → 检查 D1/KV 绑定
- 如果超时 → 可能是项目太大，需要优化

## 💡 关键点

- `@cloudflare/next-on-pages` 会将 Next.js 转换为 Cloudflare Workers 兼容格式
- API 路由会自动转换为 Pages Functions
- 需要正确绑定 D1 和 KV 才能访问数据库
