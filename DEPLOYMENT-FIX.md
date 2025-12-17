# 部署配置错误修复说明

## ❌ 遇到的错误

```
Error: Pages only supports files up to 25 MiB in size
cache/webpack/client-production/0.pack is 53.5 MiB in size
```

## 🔍 错误原因

`wrangler.toml` 中的 `pages_build_output_dir` 配置错误：

**错误配置**：
```toml
pages_build_output_dir = ".next"
```

这导致部署整个 `.next` 目录，包括：
- ❌ webpack 缓存文件（53.5 MB）
- ❌ 开发时的构建artifacts
- ❌ 各种临时文件

## ✅ 修复方案

**正确配置**：
```toml
pages_build_output_dir = ".vercel/output/static"
```

这是 `@cloudflare/next-on-pages` 的标准输出目录，只包含：
- ✅ 优化后的静态文件
- ✅ Pages Functions (Edge Functions)
- ✅ 必要的路由配置
- ✅ 总大小 < 25 MB

## 📊 部署流程

```
npm run build
    ↓
next build (生成 .next/)
    ↓
npm run pages:build
    ↓
@cloudflare/next-on-pages (处理 .next/)
    ↓
输出到 .vercel/output/static/  ← 这才是要部署的
    ↓
Cloudflare Pages 部署
```

## 🚀 已完成的修复

1. ✅ 修改 `wrangler.toml` 配置
2. ✅ 提交更改到 Git (commit: 72f7d7a)
3. ✅ 推送到 GitHub
4. ⏳ Cloudflare Pages 正在自动重新部署

## ⏭️ 下一步

等待 Cloudflare Pages 完成部署（约 2-3 分钟），然后：
1. 配置 D1 数据库绑定
2. 配置 KV 命名空间绑定
3. 测试网站功能

---

**修复时间**: 2025-11-27
**提交**: 72f7d7a
**状态**: ✅ 已修复，等待部署
