# Cloudflare Pages 配置指南

## 📋 配置步骤总览

现在需要在 Cloudflare Pages 中配置数据库和存储绑定。按照以下步骤操作：

---

## 步骤 1: 进入 Pages 项目设置

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击左侧菜单的 **Workers & Pages**
3. 找到并点击项目 **blog** 或 **blog-web**
4. 点击顶部的 **Settings** 标签

---

## 步骤 2: 配置 D1 数据库绑定

1. 在 Settings 页面，找到 **Functions** 部分
2. 滚动到 **D1 database bindings** 选项
3. 点击 **Add binding**
4. 填写以下信息：
   ```
   Variable name: DB
   D1 database: 选择 "blog-database"
   ```
5. 点击 **Save**

---

## 步骤 3: 配置 KV 命名空间绑定

1. 在同一个 **Functions** 部分
2. 找到 **KV namespace bindings**
3. 点击 **Add binding**
4. 填写以下信息：
   ```
   Variable name: KV_SESSIONS
   KV namespace: 选择对应的命名空间
   ```
5. 点击 **Save**

> 💡 如果没有 KV 命名空间，需要先创建一个：
> - 进入 **Workers & Pages** → **KV**
> - 点击 **Create namespace**
> - 名称：`blog-sessions`

---

## 步骤 4: 检查环境变量

1. 在 Settings 页面，找到 **Environment variables** 部分
2. 确认以下变量已存在：
   - ✅ `AUTH_SECRET`
   - ✅ `CLOUDFLARE_API_TOKEN`

3. **删除** `NODE_VERSION` 变量（如果存在）
   - 点击变量旁边的 **···** 菜单
   - 选择 **Delete**
   - 系统会使用 `.node-version` 文件中的版本

---

## 步骤 5: 修正构建配置

1. 在 Settings 页面，找到 **Builds & deployments** 部分
2. 检查以下配置：

| 配置项 | 正确值 |
|--------|--------|
| **Production branch** | `main` |
| **Build command** | `npx @cloudflare/next-on-pages@1` |
| **Build output directory** | `.vercel/output/static` |
| **Root directory** | `web` |

3. **移除错误的部署命令**：
   - 如果看到 `Deploy command` 或 `Version command`
   - 将它们设置为空或删除
   - Pages 会自动处理部署

---

## ✅ 配置完成检查清单

完成上述步骤后，请确认：

- [ ] D1 绑定已添加（Variable name: `DB`）
- [ ] KV 绑定已添加（Variable name: `KV_SESSIONS`）
- [ ] 环境变量 `AUTH_SECRET` 存在
- [ ] 环境变量 `CLOUDFLARE_API_TOKEN` 存在
- [ ] `NODE_VERSION` 变量已删除
- [ ] 构建命令正确
- [ ] 构建输出目录正确

---

## 🚀 触发部署

配置完成后：

1. 返回项目的 **Deployments** 标签
2. 点击 **Create deployment**
3. 选择 **main** 分支
4. 点击 **Deploy now**

或者，推送代码到 GitHub 会自动触发部署：

```bash
cd d:\Desktop\blog\web
git add .
git commit -m "feat: 完成 D1 数据库配置"
git push
```

---

## 📊 部署验证

部署完成后（约 2-3 分钟），验证以下功能：

### 前台测试
- [ ] 访问首页 `https://your-domain.pages.dev` 成功
- [ ] 点击分类/标签链接正常
- [ ] 搜索功能可用

### 后台测试
- [ ] 访问 `/admin/login` 显示登录页面
- [ ] 使用邮箱 `admin@example.com` 登录
- [ ] Dashboard 显示正常
- [ ] 可以创建测试文章
- [ ] 可以管理分类和标签

---

## ⚠️ 常见问题

**Q: "Database not available" 错误？**
A: 检查 D1 绑定的 Variable name 必须是 `DB`（大写）

**Q: 登录后立即退出？**
A: 检查 KV 绑定是否正确配置，Variable name 必须是 `KV_SESSIONS`

**Q: API 返回 500 错误？**
A: 查看 Functions logs（Settings → Functions → Real-time logs）

**Q: 构建失败？**
A: 检查构建日志，确认 Node.js 版本为 20.18.1

---

## 🎯 预期结果

配置完成并成功部署后，您将拥有：

✅ 全功能的博客系统
✅ 全球边缘数据库（D1）
✅ 管理后台
✅ 用户认证系统
✅ 文章/分类/标签管理
✅ 评论系统

**性能**：
- 全球 CDN 分发
- API 响应 < 50ms
- 数据库查询 < 10ms

现在开始配置吧！ 🚀
