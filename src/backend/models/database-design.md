# Cloudflare D1 数据库模型设计

## 1. 设计原则

- **零成本优先**: 充分利用Cloudflare D1免费额度
- **性能优化**: 合理设计表结构和索引，提高查询效率
- **简单实用**: 避免复杂查询，适应D1特性
- **安全可靠**: 保护用户数据，实现数据备份策略
- **可扩展性**: 设计应支持未来功能扩展

## 2. 实体关系图

```
users 1 ---- N posts
posts N ---- M categories (通过post_categories关联)
posts N ---- M tags (通过post_tags关联)
users 1 ---- N comments
posts 1 ---- N comments
comments 1 ---- N comments (自关联)
users 1 ---- N likes
posts/comments 1 ---- N likes
users 1 ---- N activity_logs
users 1 ---- N ai_sessions
ai_sessions 1 ---- N ai_messages
```

## 3. 表结构设计 (SQL)

### 3.1 users 表

```sql
-- db/migrations/01_create_users.sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  avatar TEXT,
  bio TEXT,
  is_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  reset_password_token TEXT,
  reset_password_expires TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token);
```

### 3.2 posts 表

```sql
-- db/migrations/02_create_posts.sql
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  author_id INTEGER NOT NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
```

### 3.3 categories 表

```sql
-- db/migrations/03_create_categories.sql
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
```

### 3.4 tags 表

```sql
-- db/migrations/04_create_tags.sql
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#4F46E5',
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
```

### 3.5 post_categories 关联表

```sql
-- db/migrations/05_create_post_categories.sql
CREATE TABLE IF NOT EXISTS post_categories (
  post_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id);
```

### 3.6 post_tags 关联表

```sql
-- db/migrations/06_create_post_tags.sql
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);
```

### 3.7 comments 表

```sql
-- db/migrations/07_create_comments.sql
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  parent_id INTEGER,
  content TEXT NOT NULL,
  is_approved INTEGER DEFAULT 1,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
```

### 3.8 likes 表

```sql
-- db/migrations/08_create_likes.sql
CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target_type TEXT NOT NULL, -- 'post' or 'comment'
  target_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
```

### 3.9 activity_logs 表

```sql
-- db/migrations/09_create_activity_logs.sql
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT, -- JSON string
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
```

### 3.10 ai_sessions 表

```sql
-- db/migrations/10_create_ai_sessions.sql
CREATE TABLE IF NOT EXISTS ai_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session_key TEXT NOT NULL UNIQUE,
  mode TEXT DEFAULT 'local',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expired_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_session_key ON ai_sessions(session_key);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_expired_at ON ai_sessions(expired_at);
```

### 3.11 ai_messages 表

```sql
-- db/migrations/11_create_ai_messages.sql
CREATE TABLE IF NOT EXISTS ai_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT,
  content_type TEXT DEFAULT 'text',
  content_media_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES ai_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_session_id_created_at ON ai_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);
```

### 3.12 ai_lexicon 表

```sql
-- db/migrations/12_create_ai_lexicon.sql
CREATE TABLE IF NOT EXISTS ai_lexicon (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keywords TEXT NOT NULL, -- JSON array
  intent TEXT NOT NULL,
  template TEXT NOT NULL,
  variables TEXT, -- JSON object
  priority INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_lexicon_priority ON ai_lexicon(priority DESC);
```

## 4. 初始数据迁移

```sql
-- db/migrations/13_insert_initial_data.sql
-- 插入默认管理员账户（密码需要在应用中加密）
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@example.com', 'placeholder_for_encrypted_password', 'admin')
ON CONFLICT(email) DO NOTHING;

-- 插入基本分类
INSERT INTO categories (name, slug, description) VALUES
('技术分享', 'tech', '技术相关文章'),
('生活随笔', 'life', '生活感悟与随笔'),
('学习笔记', 'notes', '学习过程中的笔记')
ON CONFLICT(slug) DO NOTHING;

-- 插入初始AI词库数据
INSERT INTO ai_lexicon (keywords, intent, template, priority) VALUES
('"["你好","嗨","您好","哈喽"]"', 'greeting', '您好！我是AI助手，很高兴为您服务。请问有什么我可以帮助您的吗？', 10),
('"["谢谢","感谢","thanks"]"', 'thanks', '不客气！如果还有其他问题，随时可以问我。', 5),
('"["再见","拜拜","bye"]"', 'farewell', '再见！祝您有愉快的一天！', 5)
ON CONFLICT(intent) DO NOTHING;
```

## 5. Cloudflare D1 特有优化

### 5.1 查询优化

1. **避免复杂查询**
   - 尽量使用简单的SELECT语句，避免复杂的JOIN和子查询
   - 对于复杂查询，考虑在应用层拆分处理

2. **索引策略**
   - 为WHERE子句和JOIN条件中的列创建索引
   - 避免在索引列上使用函数或表达式
   - 定期检查索引使用情况

3. **分页查询**
   - 使用OFFSET和LIMIT进行分页
   - 对于大数据量分页，考虑使用基于游标的分页

### 5.2 Cloudflare生态系统集成

1. **D1 + KV 结合使用**
   - 将频繁访问且不常变化的数据存储在KV中
   - 对热点数据实现缓存层，减少D1查询压力

2. **数据备份与恢复**
   - 利用Cloudflare D1的导出功能定期备份
   - 实现数据导出自动化脚本

3. **并发控制**
   - 使用事务确保数据一致性
   - 对于高并发场景，实现乐观锁或悲观锁机制

### 5.3 性能监控

1. **查询监控**
   - 记录慢查询日志
   - 定期分析查询性能

2. **资源监控**
   - 监控D1数据库大小和查询次数
   - 确保在免费额度内运行

## 6. 安全建议

1. **密码安全**
   - 使用bcrypt或Argon2对密码进行加密
   - 实现密码复杂度验证

2. **SQL注入防护**
   - 使用参数化查询
   - 避免直接拼接SQL语句

3. **访问控制**
   - 实现基于角色的访问控制
   - 使用Cloudflare Turnstile防止暴力攻击

4. **敏感数据保护**
   - 避免在日志中记录敏感信息
   - 实现数据脱敏机制

## 7. 部署与迁移注意事项

1. **数据库迁移流程**
   - 使用wrangler CLI进行数据库迁移
   - 先在开发环境测试迁移脚本

2. **环境变量配置**
   - 将数据库连接信息配置为环境变量
   - 区分开发、测试和生产环境

3. **部署命令示例**
   ```bash
   # 创建数据库
   wrangler d1 create blog-db

   # 执行迁移
   wrangler d1 migrations apply blog-db

   # 导出数据
   wrangler d1 execute blog-db --command="SELECT * FROM users WHERE 0" --json > users_backup.json
   ```