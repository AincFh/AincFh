# Cloudflare Pages Functions API接口规范

## 1. 总体设计原则

- **Cloudflare优先**: 充分利用Cloudflare生态系统特性
- **零成本架构**: 优化资源使用，保持在Cloudflare免费额度内
- **Serverless设计**: 基于Pages Functions的无服务器架构
- **安全可靠**: 使用Turnstile防机器人、KV存储等Cloudflare安全特性
- **性能优化**: 利用Cloudflare全球CDN加速和缓存
- **简单实用**: API设计简洁直观，易于维护

## 2. 技术架构

- **前端**: Next.js + React
- **后端**: Cloudflare Pages Functions
- **数据库**: Cloudflare D1 (SQLite兼容)
- **缓存**: Cloudflare KV
- **存储**: Cloudflare R2 (可选)
- **认证**: HttpOnly Secure Cookie + Turnstile
- **部署**: Cloudflare Pages

## 3. 文件结构

```
/functions
  /api
    /auth
      login.js
      register.js
      verify.js
      forgot-password.js
      reset-password.js
      logout.js
    /users
      profile.js
      update-profile.js
      change-password.js
    /posts
      index.js
      [id].js
    /categories
      index.js
      [id].js
    /tags
      index.js
      [id].js
    /comments
      index.js
      [id].js
    /likes
      index.js
      check.js
    /ai
      session.js
      message.js
    search.js
  /_middleware.js  # 全局中间件
  /_headers.js     # 自定义响应头
```

## 4. 用户认证模块

### 4.1 注册接口
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "confirmPassword": "string",
    "cf-turnstile-response": "turnstile-token"
  }
  ```
- **Response**:
  - Success: `201 Created`
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "id": 1,
      "username": "string",
      "email": "string",
      "role": "user"
    }
  }
  ```

### 4.2 登录接口
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "rememberMe": true,
    "cf-turnstile-response": "turnstile-token"
  }
  ```
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "user": {
        "id": 1,
        "username": "string",
        "email": "string",
        "role": "string",
        "avatar": "string"
      }
    }
  }
  ```
  - **注意**: 认证信息通过HttpOnly Secure Cookie返回，而非token

### 4.3 退出登录接口
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "退出登录成功"
  }
  ```
  - **注意**: 会清除认证Cookie

### 4.4 忘记密码接口
- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "string",
    "cf-turnstile-response": "turnstile-token"
  }
  ```
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "重置密码邮件已发送"
  }
  ```

### 4.5 重置密码接口
- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "token": "string",
    "newPassword": "string",
    "confirmPassword": "string",
    "cf-turnstile-response": "turnstile-token"
  }
  ```
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "密码重置成功"
  }
  ```

## 5. 用户管理模块

### 5.1 获取用户信息接口
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **认证**: 需要有效Cookie认证
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "string",
      "email": "string",
      "role": "string",
      "avatar": "string",
      "created_at": "date"
    }
  }
  ```

### 5.2 更新用户信息接口
- **URL**: `/api/users/update-profile`
- **Method**: `PUT`
- **认证**: 需要有效Cookie认证
- **Request Body**:
  ```json
  {
    "username": "string",
    "avatar": "string"
  }
  ```
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "用户信息更新成功",
    "data": {
      "id": 1,
      "username": "string",
      "email": "string",
      "role": "string",
      "avatar": "string"
    }
  }
  ```

### 5.3 修改密码接口
- **URL**: `/api/users/change-password`
- **Method**: `POST`
- **认证**: 需要有效Cookie认证
- **Request Body**:
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string",
    "confirmPassword": "string"
  }
  ```
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "密码修改成功"
  }
  ```

## 6. 文章管理模块

### 6.1 获取文章列表接口
- **URL**: `/api/posts`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `category_id`: 分类ID
  - `tag_id`: 标签ID
  - `sort`: 排序方式，默认`created_at:desc`
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "posts": [
        {
          "id": 1,
          "title": "string",
          "slug": "string",
          "excerpt": "string",
          "cover_image": "string",
          "author": {
            "id": 1,
            "username": "string",
            "avatar": "string"
          },
          "tags": [
            {
              "id": 1,
              "name": "string",
              "slug": "string"
            }
          ],
          "categories": [
            {
              "id": 1,
              "name": "string",
              "slug": "string"
            }
          ],
          "published_at": "date",
          "view_count": 0,
          "like_count": 0,
          "comment_count": 0
        }
      ],
      "total": 0,
      "page": 0,
      "pages": 0
    }
  }
  ```

### 6.2 获取文章详情接口
- **URL**: `/api/posts/:id`
- **Method**: `GET`
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "string",
      "slug": "string",
      "content": "string",
      "excerpt": "string",
      "cover_image": "string",
      "author": {
        "id": 1,
        "username": "string",
        "avatar": "string"
      },
      "tags": [
        {
          "id": 1,
          "name": "string",
          "slug": "string"
        }
      ],
      "categories": [
        {
          "id": 1,
          "name": "string",
          "slug": "string"
        }
      ],
      "published_at": "date",
      "created_at": "date",
      "updated_at": "date",
      "view_count": 0,
      "like_count": 0,
      "comment_count": 0
    }
  }
  ```

### 6.3 创建文章接口（管理员）
- **URL**: `/api/posts`
- **Method**: `POST`
- **认证**: 需要有效Cookie认证，且必须是管理员
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "excerpt": "string",
    "cover_image": "string",
    "status": "draft|published|archived",
    "tag_ids": [1, 2],
    "category_ids": [1, 2]
  }
  ```
- **Response**:
  - Success: `201 Created`
  ```json
  {
    "success": true,
    "message": "文章创建成功",
    "data": {
      "id": 1,
      "title": "string",
      "slug": "string",
      "content": "string",
      "excerpt": "string",
      "cover_image": "string",
      "status": "string",
      "author_id": 1,
      "tag_ids": [1, 2],
      "category_ids": [1, 2],
      "created_at": "date",
      "updated_at": "date"
    }
  }
  ```

### 6.4 更新文章接口（管理员）
- **URL**: `/api/posts/:id`
- **Method**: `PUT`
- **认证**: 需要有效Cookie认证，且必须是管理员
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "excerpt": "string",
    "cover_image": "string",
    "status": "draft|published|archived",
    "tag_ids": [1, 2],
    "category_ids": [1, 2]
  }
  ```
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "文章更新成功",
    "data": {
      "id": 1,
      "title": "string",
      "slug": "string",
      "content": "string",
      "excerpt": "string",
      "cover_image": "string",
      "status": "string",
      "author_id": 1,
      "tag_ids": [1, 2],
      "category_ids": [1, 2],
      "updated_at": "date"
    }
  }
  ```

### 6.5 删除文章接口（管理员）
- **URL**: `/api/posts/:id`
- **Method**: `DELETE`
- **认证**: 需要有效Cookie认证，且必须是管理员
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "文章删除成功"
  }
  ```

## 7. 分类管理模块

### 7.1 获取分类列表接口
- **URL**: `/api/categories`
- **Method**: `GET`
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "string",
        "slug": "string",
        "description": "string",
        "post_count": 0,
        "created_at": "date"
      }
    ]
  }
  ```

### 7.2 获取分类详情接口
- **URL**: `/api/categories/:id`
- **Method**: `GET`
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "string",
      "slug": "string",
      "description": "string",
      "post_count": 0,
      "created_at": "date"
    }
  }
  ```

## 8. 标签管理模块

### 8.1 获取标签列表接口
- **URL**: `/api/tags`
- **Method**: `GET`
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "string",
        "slug": "string",
        "color": "string",
        "post_count": 0,
        "created_at": "date"
      }
    ]
  }
  ```

### 8.2 获取标签详情接口
- **URL**: `/api/tags/:id`
- **Method**: `GET`
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "string",
      "slug": "string",
      "color": "string",
      "post_count": 0,
      "created_at": "date"
    }
  }
  ```

## 9. 搜索模块

### 9.1 全局搜索接口
- **URL**: `/api/search`
- **Method**: `GET`
- **Query Parameters**:
  - `q`: 搜索关键词
  - `type`: 搜索类型（posts|tags|categories|all），默认all
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "posts": [
        {
          "id": 1,
          "title": "string",
          "slug": "string",
          "excerpt": "string",
          "published_at": "date"
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": "string",
          "slug": "string"
        }
      ],
      "categories": [
        {
          "id": 1,
          "name": "string",
          "slug": "string"
        }
      ],
      "total": 0
    }
  }
  ```

## 10. AI助手模块

### 10.1 创建AI会话
- **URL**: `/api/ai/session`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "mode": "local", // 'local' 或 'cloud'
    "cf-turnstile-response": "turnstile-token"
  }
  ```
- **Response**:
  - Success: `201 Created`
  ```json
  {
    "success": true,
    "message": "会话创建成功",
    "data": {
      "session_id": 1,
      "session_key": "session-key-value",
      "mode": "local",
      "created_at": "date"
    }
  }
  ```

### 10.2 发送AI消息
- **URL**: `/api/ai/message`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "session_key": "session-key-value",
    "content": "你好，请问有什么可以帮助我的？",
    "content_type": "text"
  }
  ```
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "消息处理成功",
    "data": {
      "id": 1,
      "session_id": 1,
      "role": "assistant",
      "content": "您好！我是AI助手，很高兴为您服务。请问有什么我可以帮助您的吗？",
      "content_type": "text",
      "created_at": "date"
    }
  }
  ```

### 10.3 获取会话历史
- **URL**: `/api/ai/session/:sessionKey`
- **Method**: `GET`
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "session": {
        "id": 1,
        "session_key": "session-key-value",
        "mode": "local",
        "created_at": "date",
        "last_active_at": "date"
      },
      "messages": [
        {
          "id": 1,
          "session_id": 1,
          "role": "user",
          "content": "你好，请问有什么可以帮助我的？",
          "content_type": "text",
          "created_at": "date"
        },
        {
          "id": 2,
          "session_id": 1,
          "role": "assistant",
          "content": "您好！我是AI助手，很高兴为您服务。请问有什么可以帮助您的吗？",
          "content_type": "text",
          "created_at": "date"
        }
      ]
    }
  }
  ```

## 11. 评论模块

### 11.1 创建评论
- **URL**: `/api/comments`
- **Method**: `POST`
- **认证**: 需要有效Cookie认证
- **Request Body**:
  ```json
  {
    "post_id": 1,
    "content": "评论内容",
    "parent_id": null,
    "cf-turnstile-response": "turnstile-token"
  }
  ```
- **Response**:
  - Success: `201 Created`
  ```json
  {
    "success": true,
    "message": "评论创建成功",
    "data": {
      "id": 1,
      "post_id": 1,
      "user_id": 1,
      "parent_id": null,
      "content": "评论内容",
      "user": {
        "id": 1,
        "username": "string",
        "avatar": "string"
      },
      "like_count": 0,
      "created_at": "date",
      "replies": []
    }
  }
  ```

### 11.2 获取评论列表
- **URL**: `/api/comments`
- **Method**: `GET`
- **Query Parameters**:
  - `post_id`: 文章ID（必需）
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认20
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "comments": [
        {
          "id": 1,
          "post_id": 1,
          "user_id": 1,
          "parent_id": null,
          "content": "评论内容",
          "user": {
            "id": 1,
            "username": "string",
            "avatar": "string"
          },
          "like_count": 2,
          "created_at": "date",
          "is_liked": false,
          "replies": []
        }
      ],
      "total": 0,
      "page": 0,
      "pages": 0
    }
  }
  ```

### 11.3 更新评论
- **URL**: `/api/comments/:id`
- **Method**: `PUT`
- **认证**: 需要有效Cookie认证，且必须是评论作者或管理员
- **Request Body**:
  ```json
  {
    "content": "更新后的评论内容"
  }
  ```
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "评论更新成功",
    "data": {
      "id": 1,
      "content": "更新后的评论内容",
      "updated_at": "date"
    }
  }
  ```

### 11.4 删除评论
- **URL**: `/api/comments/:id`
- **Method**: `DELETE`
- **认证**: 需要有效Cookie认证，且必须是评论作者或管理员
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "评论删除成功"
  }
  ```

## 12. 点赞模块

### 12.1 点赞/取消点赞
- **URL**: `/api/likes`
- **Method**: `POST`
- **认证**: 需要有效Cookie认证
- **Request Body**:
  ```json
  {
    "target_type": "post", // 'post' 或 'comment'
    "target_id": 1
  }
  ```
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "message": "操作成功",
    "data": {
      "liked": true,
      "like_count": 11
    }
  }
  ```

### 12.2 检查是否已点赞
- **URL**: `/api/likes/check`
- **Method**: `GET`
- **认证**: 需要有效Cookie认证
- **Query Parameters**:
  - `target_type`: 'post' 或 'comment'
  - `target_id`: 目标ID
- **Response**:
  - Success: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "liked": true
    }
  }
  ```

## 13. 安全规范

### 13.1 错误处理
所有API接口返回统一的错误格式：
```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息（可选）"
}
```

### 13.2 认证和授权
- 使用HttpOnly Secure Cookie存储会话信息
- 实现会话过期机制（默认24小时）
- 使用Cloudflare Turnstile防止机器人攻击
- 密码加密使用bcrypt
- 对敏感操作实施CSRF保护

### 13.3 数据验证
- 使用参数化查询防止SQL注入
- 对所有用户输入进行严格验证
- 验证邮箱、用户名等格式
- 限制输入长度和文件上传大小
- 使用Zod进行请求数据验证

### 13.4 速率限制
- 登录接口限制：每IP每分钟最多5次尝试
- 注册接口限制：每IP每小时最多10次尝试
- 其他接口：每IP每分钟最多60次请求
- 利用Cloudflare Rate Limiting保护API

### 13.5 数据安全
- 敏感数据传输使用HTTPS
- 实现数据脱敏机制
- 定期清理过期数据和日志
- 使用Cloudflare Secrets存储敏感信息

## 14. Cloudflare特有功能集成

### 14.1 D1数据库操作
- 使用D1客户端进行SQL查询
- 实现连接池管理
- 优化查询性能

### 14.2 KV存储使用
- 缓存热点数据（分类列表、热门文章等）
- 实现缓存过期和刷新机制
- 存储频繁访问但不常变化的数据

### 14.3 Pages Functions优化
- 利用边缘计算加速响应
- 实现函数级别的缓存
- 优化冷启动性能

### 14.4 环境变量管理
- 使用Cloudflare Secrets存储敏感信息
- 区分开发和生产环境配置
- 实现配置动态更新

## 15. 性能优化建议

1. **数据库查询优化**
   - 合理使用索引
   - 避免复杂JOIN和子查询
   - 使用EXPLAIN分析查询执行计划

2. **缓存策略**
   - 对频繁访问的数据使用KV缓存
   - 设置合理的缓存过期时间
   - 实现缓存预热机制

3. **CDN优化**
   - 利用Cloudflare CDN缓存静态资源
   - 启用Brotli/Gzip压缩
   - 配置适当的缓存规则

4. **代码优化**
   - 最小化函数执行时间
   - 避免在请求处理中执行耗时操作
   - 实现异步处理机制

5. **监控与分析**
   - 使用Cloudflare Analytics监控性能
   - 记录关键指标
   - 定期分析并优化性能瓶颈