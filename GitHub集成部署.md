# ✅ 正确部署方案 - GitHub 集成

## 当前问题

您通过 `npx wrangler pages deploy .next` 部署，但是：
- ❌ `.next` 目录不支持 Cloudflare Workers
- ❌ API 路由不会工作
- ❌ 需要用 `@cloudflare/next-on-pages` 转换

但 `@cloudflare/next-on-pages` 在 Windows 上无法运行！

## ✅ 解决方案：GitHub 自动部署

让 Cloudflare 的 Linux 构建环境来运行转换工具。

### 步骤 1: 创建 GitHub 仓库

1. 访问 https://github.com
2. 点击右上角 **"New repository"** 或 **"+"** → **"New repository"**
3. 填写信息：
   - Repository name: `blog-web` (或您喜欢的名字)
   - Description: "My blog built with Next.js"
   - **Private** 或 **Public** (您选择)
   - ❌ **不要勾选** "Add a README file"
4. 点击 **"Create repository"**

### 步骤 2: 连接本地仓库到 GitHub

GitHub 会显示快速设置指令，复制类似这样的命令：

```bash
git remote add origin https://github.com/您的用户名/blog-web.git
git branch -M main
git push -u origin main
```

**或者**，在本地运行（替换为您的 GitHub 用户名）：

```powershell
cd d:\Desktop\blog\web

# 添加远程仓库
git remote add origin https://github.com/您的用户名/blog-web.git

# 推送代码
git push -u origin master
```

如果推送失败，可能需要设置 GitHub token 或 SSH key。

### 步骤 3: 在 Cloudflare Pages 连接 GitHub

1. 访问 https://dash.cloudflare.com
2. Workers & Pages → blog-web → **Settings**
3. 找到 **Git 集成**或底部的 **"Connect to Git"** 按钮
4. 点击连接，选择 **GitHub**
5. 授权 Cloudflare 访问 GitHub
6. 选择您刚创建的仓库 `blog-web`
7. 配置构建设置：
   - **Build command**: `npx @cloudflare/next-on-pages@1`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: (留空)
8. 保存并部署

### 步骤 4: 验证

连接成功后，Cloudflare 会：
- ✅ 自动触发第一次构建
- ✅ 在 Linux 环境中运行 `@cloudflare/next-on-pages`
- ✅ 正确转换 API 路由
- ✅ 部署完成

## 🆘 如果不想用 GitHub

如果您不想用 GitHub，替代方案：

1. **使用 GitLab** - 流程类似
2. **接受当前限制** - 静态页面能用，但 API 路由不工作

## 📋 我可以帮您

如果您需要帮助：
- 创建 GitHub 仓库
- 配置 Git 认证
- 连接到 Cloudflare

请告诉我！

## 🎯 最简单的方式

如果您有 GitHub 账号，我可以：
1. 帮您生成具体的命令
2. 引导您完成每一步
3. 解决遇到的问题

**您有 GitHub 账号吗？需要我详细引导吗？**
