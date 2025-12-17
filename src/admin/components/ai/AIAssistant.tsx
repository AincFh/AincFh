import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Maximize2, Minimize2, FileText, BarChart2, Search as SearchIcon, PenTool, MessageSquare, Users, Image, FolderTree, Tag, Settings } from 'lucide-react';
import { useAdminTheme } from '@/admin/contexts/ThemeContext';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

// AI Configuration - 预留外部AI API配置
interface AIConfig {
    provider: 'local' | 'openai' | 'anthropic' | 'google';
    apiKey: string;
    model: string;
}

// 词汇库条目接口
interface VocabularyEntry {
    keywords: string[]; // 相关关键词列表
    category: string; // 分类
    description: string; // 详细描述/教程
    steps?: string[]; // 操作步骤
    relatedTopics?: string[]; // 相关主题
}

// 全面的词汇库 - 包含网站所有功能、教程和操作指南
const vocabularyLibrary: VocabularyEntry[] = [
    // 通用功能
    {
        keywords: ['你好', 'hello', 'hi', '您好'],
        category: 'general',
        description: '欢迎使用博客智能助手！我可以帮助您管理博客的各个方面，包括文章管理、评论审核、用户管理、系统设置等。',
        relatedTopics: ['帮助', '功能', '介绍']
    },
    {
        keywords: ['帮助', 'help', '求助', '需要帮助'],
        category: 'general',
        description: '我可以协助您完成以下任务：\n1. 撰写和编辑文章\n2. 分析网站访问数据\n3. 管理用户评论\n4. 优化 SEO 设置\n5. 管理媒体文件\n6. 配置系统设置\n7. 管理用户权限\n8. 管理文章分类和标签\n请告诉我您需要什么帮助？',
        relatedTopics: ['功能', '介绍', '教程']
    },
    {
        keywords: ['功能', 'features', '系统功能', '网站功能'],
        category: 'general',
        description: '系统主要功能包括：\n- 仪表盘：查看站点概览和数据统计\n- 文章管理：发布、编辑和管理内容\n- 评论管理：审核和管理用户评论\n- 媒体库：管理图片和文件\n- 用户管理：管理管理员和访客权限\n- 系统设置：配置站点参数和偏好\n- 分类管理：管理文章分类\n- 标签管理：管理文章标签',
        relatedTopics: ['帮助', '介绍', '教程']
    },
    {
        keywords: ['介绍', 'about', '关于', '系统介绍'],
        category: 'general',
        description: '我是您的博客智能助手，基于关键词匹配系统构建，可以帮助您管理博客的各个方面。您可以问我关于文章、评论、用户、设置等方面的问题。',
        relatedTopics: ['帮助', '功能', '教程']
    },
    {
        keywords: ['感谢', 'thanks', 'thank you', '谢谢'],
        category: 'general',
        description: '不客气！如果您有任何其他问题，随时可以问我。',
        relatedTopics: ['再见', '帮助']
    },
    {
        keywords: ['再见', 'bye', 'goodbye', '拜拜'],
        category: 'general',
        description: '再见！祝您使用愉快。',
        relatedTopics: ['感谢', '帮助']
    },

    // 仪表盘管理
    {
        keywords: ['仪表盘', 'dashboard', '数据', '统计', '概览'],
        category: 'dashboard',
        description: '仪表盘显示站点的实时数据和统计信息，包括访问量、访客数、热门文章等。',
        steps: [
            '1. 点击左侧菜单的"仪表盘"进入',
            '2. 查看实时数据统计',
            '3. 分析访问趋势和来源',
            '4. 查看热门文章和评论'
        ],
        relatedTopics: ['数据', '流量', '访客', '热门文章']
    },
    {
        keywords: ['流量', 'traffic', '访问量', '来源'],
        category: 'dashboard',
        description: '流量统计显示网站的访问情况，包括访问来源、用户行为等。',
        steps: [
            '1. 进入仪表盘',
            '2. 查看"流量分析"模块',
            '3. 查看访问来源分布',
            '4. 分析用户行为数据'
        ],
        relatedTopics: ['数据', '访客', '访问来源', '用户行为']
    },
    {
        keywords: ['访客', 'visitors', 'uv', '独立访客'],
        category: 'dashboard',
        description: '访客统计显示网站的独立访客数、页面浏览量等数据。',
        steps: [
            '1. 进入仪表盘',
            '2. 查看"访客统计"模块',
            '3. 查看今日、本周、本月访客数据',
            '4. 分析访客增长趋势'
        ],
        relatedTopics: ['数据', '流量', '访问来源', '用户行为']
    },
    {
        keywords: ['热门文章', 'popular posts', 'top posts'],
        category: 'dashboard',
        description: '热门文章显示网站最受欢迎的文章列表。',
        steps: [
            '1. 进入仪表盘',
            '2. 查看"热门文章"模块',
            '3. 分析热门文章的特点',
            '4. 优化内容策略'
        ],
        relatedTopics: ['文章', '数据', '流量']
    },
    {
        keywords: ['访问来源', 'traffic source', '来源分析'],
        category: 'dashboard',
        description: '访问来源显示用户是通过什么渠道访问网站的。',
        steps: [
            '1. 进入仪表盘',
            '2. 查看"访问来源"模块',
            '3. 分析各来源的占比',
            '4. 优化推广策略'
        ],
        relatedTopics: ['流量', '数据', '用户行为']
    },
    {
        keywords: ['用户行为', 'user behavior', '停留时间', '浏览深度'],
        category: 'dashboard',
        description: '用户行为显示用户在网站上的活动情况，包括停留时间、浏览深度等。',
        steps: [
            '1. 进入仪表盘',
            '2. 查看"用户行为"模块',
            '3. 分析用户停留时间和浏览深度',
            '4. 优化网站体验'
        ],
        relatedTopics: ['流量', '数据', '访客']
    },

    // 文章管理
    {
        keywords: ['文章', 'posts', 'article', '内容'],
        category: 'posts',
        description: '文章管理模块用于发布、编辑和管理网站的文章内容。',
        steps: [
            '1. 点击左侧菜单的"文章管理"进入',
            '2. 查看文章列表',
            '3. 点击"新建文章"发布新内容',
            '4. 点击"编辑"修改现有文章'
        ],
        relatedTopics: ['写文章', '发布', '草稿', '编辑文章', '删除文章']
    },
    {
        keywords: ['写文章', 'write article', '新建文章', '发布文章'],
        category: 'posts',
        description: '创建和发布新文章的完整流程。',
        steps: [
            '1. 进入"文章管理"页面',
            '2. 点击右上角"新建文章"按钮',
            '3. 填写文章标题',
            '4. 在编辑器中撰写内容',
            '5. 设置文章分类和标签',
            '6. 选择发布状态（草稿/已发布）',
            '7. 点击"发布"或"保存草稿"'
        ],
        relatedTopics: ['发布', '草稿', '编辑文章', '文章分类', '文章标签']
    },
    {
        keywords: ['发布', 'publish', '发布文章', '上线'],
        category: 'posts',
        description: '发布文章的操作流程。',
        steps: [
            '1. 进入文章编辑页面',
            '2. 确保文章内容完整',
            '3. 设置文章分类和标签',
            '4. 选择"已发布"状态',
            '5. 点击"发布"按钮'
        ],
        relatedTopics: ['写文章', '草稿', '编辑文章']
    },
    {
        keywords: ['草稿', 'draft', '保存草稿', '草稿箱'],
        category: 'posts',
        description: '草稿功能用于保存未完成的文章，方便后续继续编辑。',
        steps: [
            '1. 进入文章编辑页面',
            '2. 撰写文章内容',
            '3. 点击"保存草稿"按钮',
            '4. 在文章列表的"草稿箱"标签下查看保存的草稿'
        ],
        relatedTopics: ['写文章', '发布', '编辑文章']
    },
    {
        keywords: ['编辑文章', 'edit post', '修改文章', '更新文章'],
        category: 'posts',
        description: '编辑现有文章的操作流程。',
        steps: [
            '1. 进入"文章管理"页面',
            '2. 在文章列表中找到要编辑的文章',
            '3. 点击右侧的"编辑"按钮',
            '4. 修改文章内容',
            '5. 点击"更新"按钮保存更改'
        ],
        relatedTopics: ['文章', '发布', '草稿', '删除文章']
    },
    {
        keywords: ['删除文章', 'delete post', '移除文章', '清理文章'],
        category: 'posts',
        description: '删除文章的操作流程。',
        steps: [
            '1. 进入"文章管理"页面',
            '2. 在文章列表中找到要删除的文章',
            '3. 点击右侧的"删除"按钮',
            '4. 在确认对话框中点击"确认"'
        ],
        relatedTopics: ['文章', '编辑文章', '批量操作']
    },
    {
        keywords: ['批量操作', 'batch operations', '批量处理', '批量管理'],
        category: 'posts',
        description: '批量操作功能用于同时处理多篇文章。',
        steps: [
            '1. 进入"文章管理"页面',
            '2. 勾选要处理的多篇文章',
            '3. 点击顶部的批量操作按钮',
            '4. 选择操作类型（发布/草稿/删除）',
            '5. 点击"应用"执行操作'
        ],
        relatedTopics: ['文章', '编辑文章', '删除文章']
    },
    {
        keywords: ['文章分类', 'post category', '分类管理', '文章类别'],
        category: 'posts',
        description: '文章分类用于组织和筛选文章内容。',
        steps: [
            '1. 点击左侧菜单的"分类管理"进入',
            '2. 点击"新建分类"创建新分类',
            '3. 填写分类名称和描述',
            '4. 点击"保存"',
            '5. 在发布文章时选择对应的分类'
        ],
        relatedTopics: ['分类', '标签', '文章标签', '分类树']
    },
    {
        keywords: ['文章标签', 'post tags', '标签管理', '文章关键词'],
        category: 'posts',
        description: '文章标签用于标记文章的关键词和主题。',
        steps: [
            '1. 点击左侧菜单的"标签管理"进入',
            '2. 点击"新建标签"创建新标签',
            '3. 填写标签名称',
            '4. 点击"保存"',
            '5. 在发布文章时添加相关标签'
        ],
        relatedTopics: ['标签', '分类', '文章分类', '标签云']
    },
    {
        keywords: ['文章统计', 'post stats', '文章数据', '阅读量'],
        category: 'posts',
        description: '查看文章的统计数据，包括阅读量、评论数等。',
        steps: [
            '1. 进入"文章管理"页面',
            '2. 在文章列表中查看每篇文章的统计数据',
            '3. 点击文章标题查看详细统计',
            '4. 分析文章表现'
        ],
        relatedTopics: ['数据', '流量', '评论', '热门文章']
    },

    // SEO优化
    {
        keywords: ['seo', '搜索引擎优化', '优化', '排名'],
        category: 'seo',
        description: 'SEO优化用于提升网站在搜索引擎中的排名，增加自然流量。',
        steps: [
            '1. 进入"系统设置"的"SEO设置"页面',
            '2. 配置站点元标签',
            '3. 优化文章标题和描述',
            '4. 添加图片Alt文本',
            '5. 构建高质量的内外链接',
            '6. 提交站点地图'
        ],
        relatedTopics: ['关键词', '标题优化', '描述优化', '图片优化', '内部链接', '外部链接']
    },
    {
        keywords: ['关键词', 'keywords', '关键词研究', '关键词优化'],
        category: 'seo',
        description: '关键词是用户在搜索引擎中输入的词语，合理使用关键词可以提升SEO效果。',
        steps: [
            '1. 使用关键词研究工具分析热门搜索词',
            '2. 选择与内容相关的关键词',
            '3. 在文章标题、内容中自然融入关键词',
            '4. 避免关键词堆砌'
        ],
        relatedTopics: ['seo', '标题优化', '描述优化', '内容优化']
    },
    {
        keywords: ['标题优化', 'title optimization', '优化标题', '标题SEO'],
        category: 'seo',
        description: '优化文章标题以提升SEO效果和点击率。',
        steps: [
            '1. 在标题中包含主要关键词',
            '2. 控制标题长度在50-60个字符',
            '3. 使标题吸引用户点击',
            '4. 避免重复关键词',
            '5. 使用数字和疑问词提高吸引力'
        ],
        relatedTopics: ['seo', '关键词', '描述优化', '内容优化']
    },
    {
        keywords: ['描述优化', 'meta description', '描述SEO', '优化描述'],
        category: 'seo',
        description: '优化文章描述以提升SEO效果和点击率。',
        steps: [
            '1. 在描述中包含主要关键词',
            '2. 控制描述长度在150-160个字符',
            '3. 简明扼要地描述文章内容',
            '4. 吸引用户点击',
            '5. 每个页面使用独特的描述'
        ],
        relatedTopics: ['seo', '关键词', '标题优化', '内容优化']
    },
    {
        keywords: ['图片优化', 'image optimization', '优化图片', '图片SEO'],
        category: 'seo',
        description: '优化图片以提升SEO效果和页面加载速度。',
        steps: [
            '1. 使用描述性的文件名',
            '2. 添加Alt文本，包含关键词',
            '3. 压缩图片大小',
            '4. 使用合适的图片格式（WebP优先）',
            '5. 添加图片描述'
        ],
        relatedTopics: ['seo', '媒体库', '图片', '上传']
    },
    {
        keywords: ['内部链接', 'internal links', '内链', '链接建设'],
        category: 'seo',
        description: '内部链接用于连接网站内部的不同页面，提升SEO效果和用户体验。',
        steps: [
            '1. 在文章中添加相关文章的链接',
            '2. 使用描述性的锚文本',
            '3. 避免过度链接',
            '4. 保持链接结构清晰',
            '5. 确保链接可访问'
        ],
        relatedTopics: ['seo', '外部链接', '链接建设', '内容优化']
    },
    {
        keywords: ['外部链接', 'external links', '外链', '反向链接'],
        category: 'seo',
        description: '外部链接指向其他网站的链接，高质量的外部链接可以提升网站权威性。',
        steps: [
            '1. 链接到权威网站',
            '2. 确保链接内容相关',
            '3. 使用nofollow属性标记不可信链接',
            '4. 定期检查链接有效性',
            '5. 避免购买链接'
        ],
        relatedTopics: ['seo', '内部链接', '链接建设', '内容优化']
    },

    // 评论管理
    {
        keywords: ['评论', 'comments', '评论管理', '用户评论'],
        category: 'comments',
        description: '评论管理模块用于审核和管理用户评论。',
        steps: [
            '1. 点击左侧菜单的"评论管理"进入',
            '2. 查看待审核评论',
            '3. 审核通过或拒绝评论',
            '4. 回复用户评论',
            '5. 删除垃圾评论'
        ],
        relatedTopics: ['审核评论', '回复评论', '删除评论', '垃圾评论', '评论设置']
    },
    {
        keywords: ['审核评论', 'approve comments', '评论审核', '审核用户评论'],
        category: 'comments',
        description: '审核评论的操作流程。',
        steps: [
            '1. 进入"评论管理"页面',
            '2. 查看"待审核"标签下的评论',
            '3. 点击评论右侧的"通过"或"拒绝"按钮',
            '4. 可以批量审核多条评论'
        ],
        relatedTopics: ['评论', '回复评论', '删除评论', '评论设置']
    },
    {
        keywords: ['回复评论', 'reply to comment', '评论回复', '回复用户'],
        category: 'comments',
        description: '回复用户评论的操作流程。',
        steps: [
            '1. 进入"评论管理"页面',
            '2. 找到要回复的评论',
            '3. 点击评论右侧的"回复"按钮',
            '4. 在回复框中输入回复内容',
            '5. 点击"提交"发送回复'
        ],
        relatedTopics: ['评论', '审核评论', '删除评论', '评论设置']
    },
    {
        keywords: ['删除评论', 'delete comment', '移除评论', '清理评论'],
        category: 'comments',
        description: '删除评论的操作流程。',
        steps: [
            '1. 进入"评论管理"页面',
            '2. 找到要删除的评论',
            '3. 点击评论右侧的"删除"按钮',
            '4. 可以批量删除多条评论',
            '5. 在"垃圾箱"中可以恢复或永久删除评论'
        ],
        relatedTopics: ['评论', '审核评论', '回复评论', '垃圾评论']
    },
    {
        keywords: ['垃圾评论', 'spam comments', '过滤垃圾评论', '垃圾评论处理'],
        category: 'comments',
        description: '系统会自动拦截疑似垃圾评论，需要手动处理。',
        steps: [
            '1. 进入"评论管理"页面',
            '2. 查看"垃圾箱"标签下的评论',
            '3. 检查是否有误判的评论',
            '4. 点击"恢复"或"永久删除"',
            '5. 在"系统设置"中配置垃圾评论过滤规则'
        ],
        relatedTopics: ['评论', '删除评论', '评论设置', '审核评论']
    },
    {
        keywords: ['评论设置', 'comment settings', '配置评论', '评论选项'],
        category: 'comments',
        description: '配置评论功能的各项参数。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"评论设置"部分',
            '3. 配置是否需要审核',
            '4. 配置是否允许匿名评论',
            '5. 配置评论通知设置',
            '6. 配置垃圾评论过滤规则'
        ],
        relatedTopics: ['评论', '审核评论', '垃圾评论', '系统设置']
    },

    // 用户管理
    {
        keywords: ['用户', 'users', '用户管理', '会员管理'],
        category: 'users',
        description: '用户管理模块用于管理网站的用户，包括管理员和普通用户。',
        steps: [
            '1. 点击左侧菜单的"用户管理"进入',
            '2. 查看用户列表',
            '3. 添加新用户',
            '4. 编辑用户信息',
            '5. 修改用户权限',
            '6. 封禁或解封用户'
        ],
        relatedTopics: ['权限', '注册', '登录', '忘记密码', '封禁用户', '解封用户']
    },
    {
        keywords: ['权限', 'permissions', '用户权限', '角色权限'],
        category: 'users',
        description: '系统支持多种角色权限，用于控制用户的操作范围。',
        steps: [
            '1. 进入"用户管理"页面',
            '2. 点击用户右侧的"编辑"按钮',
            '3. 在"角色权限"部分选择合适的角色',
            '4. 点击"保存"应用更改'
        ],
        relatedTopics: ['用户', '管理员', '编辑', '作者', '普通用户']
    },
    {
        keywords: ['注册', 'register', '用户注册', '新用户'],
        category: 'users',
        description: '用户注册的配置和管理。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"注册设置"部分',
            '3. 配置注册方式（公开注册/邀请注册）',
            '4. 配置注册验证方式',
            '5. 配置新用户默认权限'
        ],
        relatedTopics: ['用户', '登录', '忘记密码', '权限']
    },
    {
        keywords: ['登录', 'login', '用户登录', '管理员登录'],
        category: 'users',
        description: '用户登录的配置和管理。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"登录设置"部分',
            '3. 配置登录选项（验证码、记住我）',
            '4. 配置登录失败限制',
            '5. 配置登录后跳转页面'
        ],
        relatedTopics: ['用户', '注册', '忘记密码', '权限']
    },
    {
        keywords: ['忘记密码', 'forgot password', '重置密码', '密码找回'],
        category: 'users',
        description: '用户忘记密码的处理流程。',
        steps: [
            '1. 用户点击登录页面的"忘记密码"链接',
            '2. 输入注册邮箱',
            '3. 系统发送密码重置邮件',
            '4. 用户点击邮件中的链接重置密码',
            '5. 设置新密码'
        ],
        relatedTopics: ['用户', '登录', '注册', '密码设置']
    },
    {
        keywords: ['封禁用户', 'ban user', '禁用用户', '限制登录'],
        category: 'users',
        description: '封禁用户的操作流程。',
        steps: [
            '1. 进入"用户管理"页面',
            '2. 找到要封禁的用户',
            '3. 点击用户右侧的"封禁"按钮',
            '4. 确认封禁操作',
            '5. 封禁后用户将无法登录系统'
        ],
        relatedTopics: ['用户', '权限', '解封用户', '用户管理']
    },
    {
        keywords: ['解封用户', 'unban user', '启用用户', '恢复登录'],
        category: 'users',
        description: '解封被封禁用户的操作流程。',
        steps: [
            '1. 进入"用户管理"页面',
            '2. 切换到"已封禁"标签',
            '3. 找到要解封的用户',
            '4. 点击用户右侧的"解封"按钮',
            '5. 确认解封操作',
            '6. 解封后用户可以正常登录系统'
        ],
        relatedTopics: ['用户', '权限', '封禁用户', '用户管理']
    },

    // 媒体管理
    {
        keywords: ['媒体库', 'media library', '媒体管理', '文件管理'],
        category: 'media',
        description: '媒体库用于管理网站的图片和文件。',
        steps: [
            '1. 点击左侧菜单的"媒体库"进入',
            '2. 查看媒体文件列表',
            '3. 上传新文件',
            '4. 编辑文件信息',
            '5. 复制文件链接',
            '6. 删除无用文件'
        ],
        relatedTopics: ['图片', '上传', '文件类型', '文件大小', '图片优化']
    },
    {
        keywords: ['图片', 'images', '图片管理', '上传图片'],
        category: 'media',
        description: '管理网站图片的操作流程。',
        steps: [
            '1. 进入"媒体库"页面',
            '2. 点击"上传"按钮',
            '3. 选择要上传的图片文件',
            '4. 等待上传完成',
            '5. 在文章中插入图片'
        ],
        relatedTopics: ['媒体库', '上传', '文件类型', '文件大小', '图片优化']
    },
    {
        keywords: ['上传', 'upload', '上传文件', '上传图片'],
        category: 'media',
        description: '上传文件到媒体库的操作流程。',
        steps: [
            '1. 进入"媒体库"页面',
            '2. 点击"上传"按钮',
            '3. 选择要上传的文件',
            '4. 等待上传完成',
            '5. 查看上传结果'
        ],
        relatedTopics: ['媒体库', '图片', '文件类型', '文件大小', '批量上传']
    },
    {
        keywords: ['文件类型', 'file types', '允许的文件类型', '支持的格式'],
        category: 'media',
        description: '系统支持的文件类型配置。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"媒体设置"部分',
            '3. 配置允许上传的文件类型',
            '4. 保存配置'
        ],
        relatedTopics: ['媒体库', '上传', '文件大小', '图片优化']
    },
    {
        keywords: ['文件大小', 'file size', '最大文件大小', '上传限制'],
        category: 'media',
        description: '配置文件上传大小限制。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"媒体设置"部分',
            '3. 配置单文件最大上传大小',
            '4. 保存配置'
        ],
        relatedTopics: ['媒体库', '上传', '文件类型', '图片优化']
    },
    {
        keywords: ['图片优化', 'image optimization', '优化图片', '图片压缩'],
        category: 'media',
        description: '配置图片自动优化功能。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"媒体设置"部分',
            '3. 开启图片优化功能',
            '4. 配置优化选项（压缩质量、格式转换）',
            '5. 保存配置'
        ],
        relatedTopics: ['媒体库', '图片', '上传', 'seo']
    },

    // 系统设置
    {
        keywords: ['设置', 'settings', '系统设置', '网站设置'],
        category: 'settings',
        description: '系统设置模块用于配置网站的各项参数和偏好。',
        steps: [
            '1. 点击左侧菜单的"系统设置"进入',
            '2. 浏览不同的设置分类',
            '3. 修改需要调整的设置',
            '4. 点击"保存更改"应用设置'
        ],
        relatedTopics: ['备份', '恢复', '导出', '导入', '语言', '时区']
    },
    {
        keywords: ['备份', 'backup', '数据库备份', '系统备份'],
        category: 'settings',
        description: '系统备份功能用于保护网站数据。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"备份设置"部分',
            '3. 点击"手动备份"立即备份',
            '4. 配置自动备份选项',
            '5. 查看备份历史记录'
        ],
        relatedTopics: ['设置', '恢复', '系统维护', '数据安全']
    },
    {
        keywords: ['恢复', 'restore', '恢复数据', '从备份恢复'],
        category: 'settings',
        description: '从备份恢复网站数据的操作流程。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"备份设置"部分',
            '3. 查看备份历史记录',
            '4. 选择要恢复的备份',
            '5. 点击"恢复"按钮',
            '6. 确认恢复操作'
        ],
        relatedTopics: ['设置', '备份', '系统维护', '数据安全']
    },
    {
        keywords: ['导出', 'export', '导出数据', '数据导出'],
        category: 'settings',
        description: '导出网站数据的操作流程。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"数据导出"部分',
            '3. 选择要导出的数据类型（文章/评论/用户）',
            '4. 选择导出格式（CSV/JSON）',
            '5. 点击"导出"按钮',
            '6. 下载导出文件'
        ],
        relatedTopics: ['设置', '导入', '备份', '数据管理']
    },
    {
        keywords: ['导入', 'import', '导入数据', '数据导入'],
        category: 'settings',
        description: '导入数据到网站的操作流程。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"数据导入"部分',
            '3. 选择要导入的数据类型',
            '4. 选择导入文件',
            '5. 点击"导入"按钮',
            '6. 查看导入结果'
        ],
        relatedTopics: ['设置', '导出', '备份', '数据管理']
    },
    {
        keywords: ['语言', 'language', '网站语言', '多语言'],
        category: 'settings',
        description: '配置网站语言的操作流程。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"语言设置"部分',
            '3. 选择网站默认语言',
            '4. 配置支持的语言列表',
            '5. 保存配置'
        ],
        relatedTopics: ['设置', '国际化', '本地化']
    },
    {
        keywords: ['时区', 'timezone', '网站时区', '时间设置'],
        category: 'settings',
        description: '配置网站时区的操作流程。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"时间设置"部分',
            '3. 选择合适的时区',
            '4. 保存配置',
            '5. 验证时间显示是否正确'
        ],
        relatedTopics: ['设置', '时间格式', '日期格式']
    },

    // 分类和标签管理
    {
        keywords: ['分类', 'categories', '分类管理', '文章分类'],
        category: 'categories',
        description: '管理文章分类的操作流程。',
        steps: [
            '1. 点击左侧菜单的"分类管理"进入',
            '2. 查看分类列表',
            '3. 点击"新建分类"创建新分类',
            '4. 填写分类名称和描述',
            '5. 设置分类顺序和父分类',
            '6. 点击"保存"'
        ],
        relatedTopics: ['分类树', '文章分类', '标签', '文章标签']
    },
    {
        keywords: ['标签', 'tags', '标签管理', '文章标签'],
        category: 'tags',
        description: '管理文章标签的操作流程。',
        steps: [
            '1. 点击左侧菜单的"标签管理"进入',
            '2. 查看标签列表',
            '3. 点击"新建标签"创建新标签',
            '4. 填写标签名称',
            '5. 点击"保存"'
        ],
        relatedTopics: ['文章标签', '标签云', '分类', '文章分类']
    },
    {
        keywords: ['分类树', 'category tree', '多级分类', '分类层级'],
        category: 'categories',
        description: '创建和管理多级分类树的操作流程。',
        steps: [
            '1. 进入"分类管理"页面',
            '2. 创建父分类',
            '3. 创建子分类并选择父分类',
            '4. 调整分类顺序',
            '5. 在文章中使用多级分类'
        ],
        relatedTopics: ['分类', '文章分类', '标签', '文章标签']
    },
    {
        keywords: ['标签云', 'tag cloud', '标签展示', '热门标签'],
        category: 'tags',
        description: '标签云用于展示网站的热门标签。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"标签设置"部分',
            '3. 配置标签云显示选项',
            '4. 保存配置',
            '5. 在前台页面查看标签云'
        ],
        relatedTopics: ['标签', '文章标签', '分类', '文章分类']
    },

    // 系统性能和维护
    {
        keywords: ['慢', 'slow', '系统慢', '网站卡顿'],
        category: 'performance',
        description: '解决系统响应慢的问题。',
        steps: [
            '1. 检查网络连接',
            '2. 清理浏览器缓存',
            '3. 检查服务器资源使用情况',
            '4. 优化网站图片',
            '5. 检查插件和主题',
            '6. 启用缓存功能'
        ],
        relatedTopics: ['卡顿', '错误', '更新', '维护']
    },
    {
        keywords: ['卡顿', 'lag', '网站卡顿', '页面卡顿'],
        category: 'performance',
        description: '解决网站卡顿的问题。',
        steps: [
            '1. 清理浏览器缓存',
            '2. 检查网络连接',
            '3. 关闭不必要的浏览器标签',
            '4. 检查网站的JavaScript错误',
            '5. 优化网站性能'
        ],
        relatedTopics: ['慢', '错误', '更新', '维护']
    },
    {
        keywords: ['错误', 'error', '网站错误', '系统报错'],
        category: 'performance',
        description: '处理网站错误的流程。',
        steps: [
            '1. 截图保存错误信息',
            '2. 查看浏览器控制台日志',
            '3. 检查服务器日志',
            '4. 尝试刷新页面',
            '5. 清除浏览器缓存',
            '6. 联系技术支持'
        ],
        relatedTopics: ['慢', '卡顿', '更新', '维护']
    },
    {
        keywords: ['更新', 'update', '系统更新', '版本更新'],
        category: 'performance',
        description: '更新系统和插件的操作流程。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"更新设置"部分',
            '3. 点击"检查更新"',
            '4. 如果有更新，点击"更新"按钮',
            '5. 等待更新完成',
            '6. 验证更新结果'
        ],
        relatedTopics: ['慢', '卡顿', '错误', '维护']
    },
    {
        keywords: ['维护', 'maintenance', '系统维护', '网站维护'],
        category: 'performance',
        description: '网站日常维护的建议。',
        steps: [
            '1. 定期备份数据',
            '2. 更新系统和插件',
            '3. 清理无用数据',
            '4. 检查安全设置',
            '5. 优化网站性能',
            '6. 监控网站状态'
        ],
        relatedTopics: ['慢', '卡顿', '错误', '更新', '备份']
    },

    // AI助手自身
    {
        keywords: ['ai', 'ai助手', '智能助手', '助手'],
        category: 'ai',
        description: '我是您的博客智能助手，基于全面的词汇库构建，可以帮助您管理博客的各个方面。您可以问我关于文章、评论、用户、设置等方面的问题。',
        relatedTopics: ['智能', '升级', '配置', '帮助']
    },
    {
        keywords: ['智能', 'intelligent', '智能回复', 'AI智能'],
        category: 'ai',
        description: '我目前基于词汇库匹配系统工作，可以理解和回答关于博客管理的各种问题。系统已经预留了外部AI API接口，可以后续集成OpenAI、Anthropic等高级AI服务。',
        relatedTopics: ['ai', '升级', '配置', '外部AI']
    },
    {
        keywords: ['升级', 'upgrade', 'AI升级', '智能升级'],
        category: 'ai',
        description: '您可以在"系统设置"页面配置AI助手选项，包括切换到外部AI API服务，如OpenAI、Anthropic或Google Gemini。',
        relatedTopics: ['ai', '智能', '配置', '外部AI']
    },
    {
        keywords: ['配置', 'configure', 'AI配置', '助手配置'],
        category: 'ai',
        description: '在"系统设置"页面，您可以配置AI助手的各项参数，包括API密钥、模型选择、提供商选择等。',
        relatedTopics: ['ai', '智能', '升级', '外部AI']
    },
    {
        keywords: ['切换', 'switch', '本地AI', '外部AI', '一键切换'],
        category: 'ai',
        description: '您可以在"系统设置"页面的AI助手配置中，一键切换本地AI和外部AI服务。本地AI基于词汇库匹配，无需网络连接；外部AI可以提供更智能的回答，但需要配置API密钥。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"AI助手配置"部分',
            '3. 在"AI提供商"下拉菜单中选择"local"或其他外部AI服务',
            '4. 如果选择外部AI，填写相应的API密钥和模型信息',
            '5. 点击"保存更改"应用配置'
        ],
        relatedTopics: ['ai', '配置', '升级', '外部AI']
    },
    {
        keywords: ['配置持久化', '保存配置', '配置保存'],
        category: 'ai',
        description: 'AI助手的配置会自动保存到浏览器的localStorage中，确保刷新页面或重新登录后配置不会丢失。',
        relatedTopics: ['ai', '配置', '切换', '外部AI']
    },

    // 设计器功能
    {
        keywords: ['设计器', 'designer', '页面设计', '模板设计'],
        category: 'designer',
        description: '设计器功能用于创建和编辑网站页面模板。',
        steps: [
            '1. 点击左侧菜单的"设计器"进入',
            '2. 查看现有模板列表',
            '3. 点击"新建模板"创建新模板',
            '4. 使用拖拽式编辑器设计页面',
            '5. 保存模板并应用到网站'
        ],
        relatedTopics: ['模板', '页面设计', '拖拽', '编辑器']
    },
    {
        keywords: ['模板', 'template', '页面模板', '网站模板'],
        category: 'designer',
        description: '模板是网站页面的基础结构，使用设计器可以创建和编辑模板。',
        steps: [
            '1. 进入"设计器"页面',
            '2. 选择要编辑的模板',
            '3. 使用设计器工具修改模板结构',
            '4. 保存模板更改',
            '5. 预览模板效果'
        ],
        relatedTopics: ['设计器', '页面设计', '拖拽', '编辑器']
    },

    // 个人资料管理
    {
        keywords: ['个人资料', 'profile', '我的资料', '资料设置'],
        category: 'profile',
        description: '个人资料管理用于修改管理员的个人信息和偏好设置。',
        steps: [
            '1. 点击左侧菜单的"个人资料"进入',
            '2. 查看当前个人信息',
            '3. 修改需要更新的信息（姓名、邮箱、头像等）',
            '4. 点击"保存更改"应用更新'
        ],
        relatedTopics: ['密码', '安全设置', '头像', '个人信息']
    },
    {
        keywords: ['密码', 'password', '修改密码', '密码设置'],
        category: 'profile',
        description: '修改管理员密码的操作流程。',
        steps: [
            '1. 进入"个人资料"页面',
            '2. 切换到"安全设置"选项卡',
            '3. 输入当前密码',
            '4. 输入新密码',
            '5. 确认新密码',
            '6. 点击"保存更改"应用新密码'
        ],
        relatedTopics: ['个人资料', '安全设置', '忘记密码']
    },
    {
        keywords: ['安全设置', 'security', '账户安全', '安全选项'],
        category: 'profile',
        description: '账户安全设置用于保护管理员账户的安全。',
        steps: [
            '1. 进入"个人资料"页面',
            '2. 切换到"安全设置"选项卡',
            '3. 配置两步验证（如果可用）',
            '4. 修改密码',
            '5. 查看登录历史',
            '6. 管理设备登录'
        ],
        relatedTopics: ['个人资料', '密码', '两步验证', '登录历史']
    },

    // 认证和登录流程
    {
        keywords: ['登录', 'login', '管理员登录', '后台登录'],
        category: 'auth',
        description: '管理员登录后台系统的操作流程。',
        steps: [
            '1. 访问后台登录页面（/admin/login）',
            '2. 输入管理员用户名或邮箱',
            '3. 输入密码',
            '4. 点击"登录"按钮',
            '5. 成功登录后跳转到仪表盘页面'
        ],
        relatedTopics: ['认证', '权限', '忘记密码', '登录失败']
    },
    {
        keywords: ['登录失败', 'login failed', '无法登录', '登录错误'],
        category: 'auth',
        description: '解决登录失败问题的方法。',
        steps: [
            '1. 检查用户名和密码是否正确',
            '2. 检查网络连接是否正常',
            '3. 清除浏览器缓存',
            '4. 尝试使用"忘记密码"功能重置密码',
            '5. 联系系统管理员获取帮助'
        ],
        relatedTopics: ['登录', '忘记密码', '认证', '权限']
    },
    {
        keywords: ['退出登录', 'logout', '登出', '注销'],
        category: 'auth',
        description: '退出管理员账户的操作流程。',
        steps: [
            '1. 点击页面右上角的用户头像',
            '2. 在下拉菜单中选择"退出登录"',
            '3. 确认退出操作',
            '4. 系统将跳转到登录页面'
        ],
        relatedTopics: ['登录', '认证', '权限']
    },

    // 权限管理
    {
        keywords: ['角色', 'role', '用户角色', '角色管理'],
        category: 'permissions',
        description: '角色是一组权限的集合，用于控制不同用户的操作范围。',
        steps: [
            '1. 进入"系统设置"页面',
            '2. 找到"角色管理"部分',
            '3. 查看现有角色列表',
            '4. 点击"新建角色"创建新角色',
            '5. 配置角色权限',
            '6. 点击"保存"应用更改'
        ],
        relatedTopics: ['权限', '用户管理', '管理员', '编辑']
    },
    {
        keywords: ['管理员', 'admin', '超级管理员', '管理员权限'],
        category: 'permissions',
        description: '管理员是系统的最高权限角色，可以执行所有操作。',
        relatedTopics: ['角色', '权限', '用户管理', '编辑']
    },
    {
        keywords: ['编辑', 'editor', '编辑权限', '内容编辑'],
        category: 'permissions',
        description: '编辑角色可以创建和编辑文章，但不能修改系统设置。',
        relatedTopics: ['角色', '权限', '用户管理', '管理员']
    },
    {
        keywords: ['作者', 'author', '作者权限', '内容创作'],
        category: 'permissions',
        description: '作者角色可以创建和编辑自己的文章，但不能编辑其他用户的文章。',
        relatedTopics: ['角色', '权限', '用户管理', '编辑']
    },
    {
        keywords: ['普通用户', 'user', '访客', '读者'],
        category: 'permissions',
        description: '普通用户角色只能查看内容，不能进行编辑操作。',
        relatedTopics: ['角色', '权限', '用户管理', '作者']
    },
];

// 智能关键词匹配函数 - 优化版
const matchKeywords = (query: string): VocabularyEntry | null => {
    const lowerQuery = query.toLowerCase();
    let bestMatch: VocabularyEntry | null = null;
    let highestScore = 0;

    // 遍历词汇库，计算匹配分数
    for (const entry of vocabularyLibrary) {
        let score = 0;

        // 检查每个关键词的匹配情况
        for (const keyword of entry.keywords) {
            const lowerKeyword = keyword.toLowerCase();
            if (lowerQuery === lowerKeyword) {
                // 完全匹配分数最高
                score += 15;
            } else if (lowerQuery.includes(lowerKeyword)) {
                // 包含匹配分数次之
                score += 8;

                // 关键词在开头或结尾，分数更高
                if (lowerQuery.startsWith(lowerKeyword) || lowerQuery.endsWith(lowerKeyword)) {
                    score += 3;
                }
            }
        }

        // 检查相关主题匹配
        if (entry.relatedTopics) {
            for (const topic of entry.relatedTopics) {
                if (lowerQuery.includes(topic.toLowerCase())) {
                    score += 3;
                }
            }
        }

        // 检查分类匹配
        if (lowerQuery.includes(entry.category.toLowerCase())) {
            score += 5;
        }

        // 更新最佳匹配
        if (score > highestScore) {
            highestScore = score;
            bestMatch = entry;
        }
    }

    return bestMatch;
};

export default function AIAssistant() {
    const { theme } = useAdminTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: '你好！我是您的博客 AI 助手。我可以帮您撰写文章、优化 SEO、分析数据或解答技术问题。试着问我"怎么写文章"或"SEO建议"。',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // AI 配置状态 - 从 localStorage 或设置中获取
    const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
        // 尝试从 localStorage 获取配置，否则使用默认配置
        const savedConfig = localStorage.getItem('aiAssistantConfig');
        return savedConfig ? JSON.parse(savedConfig) : {
            provider: 'local',
            apiKey: '',
            model: 'gpt-4o-mini'
        };
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // 保存 AI 配置到 localStorage
    const saveAIConfig = (config: AIConfig) => {
        setAiConfig(config);
        localStorage.setItem('aiAssistantConfig', JSON.stringify(config));
    };

    // 外部 AI API 调用函数
    const callExternalAI = async (prompt: string): Promise<string> => {
        try {
            let responseText = '';

            switch (aiConfig.provider) {
                case 'openai':
                    // OpenAI API 调用示例
                    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${aiConfig.apiKey}`
                        },
                        body: JSON.stringify({
                            model: aiConfig.model,
                            messages: [
                                { role: 'system', content: '你是一个专业的博客管理助手，帮助用户管理博客的各个方面。' },
                                { role: 'user', content: prompt }
                            ],
                            max_tokens: 500
                        })
                    });
                    const openaiData = await openaiResponse.json();
                    responseText = openaiData.choices[0].message.content;
                    break;

                case 'anthropic':
                    // Anthropic API 调用示例
                    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': aiConfig.apiKey,
                            'anthropic-version': '2023-06-01'
                        },
                        body: JSON.stringify({
                            model: aiConfig.model,
                            messages: [
                                { role: 'user', content: prompt }
                            ],
                            max_tokens: 500
                        })
                    });
                    const anthropicData = await anthropicResponse.json();
                    responseText = anthropicData.content[0].text;
                    break;

                case 'google':
                    // Google Gemini API 调用示例
                    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model}:generateContent?key=${aiConfig.apiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        { text: prompt }
                                    ]
                                }
                            ]
                        })
                    });
                    const googleData = await googleResponse.json();
                    responseText = googleData.candidates[0].content.parts[0].text;
                    break;

                default:
                    // 默认使用本地关键词匹配
                    responseText = '未配置外部AI服务，请在设置中配置。';
            }

            return responseText;
        } catch (error) {
            console.error('外部AI API调用失败:', error);
            return '外部AI服务调用失败，请检查配置或稍后再试。';
        }
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        let responseText = '';

        if (aiConfig.provider === 'local') {
            // 使用智能词汇库匹配系统
            const matchedEntry = matchKeywords(text);

            if (matchedEntry) {
                // 构建完整回复，包含描述和步骤
                responseText = `### ${matchedEntry.category === 'general' ? '通用信息' : matchedEntry.category === 'dashboard' ? '仪表盘管理' : matchedEntry.category === 'posts' ? '文章管理' : matchedEntry.category === 'seo' ? 'SEO优化' : matchedEntry.category === 'comments' ? '评论管理' : matchedEntry.category === 'users' ? '用户管理' : matchedEntry.category === 'media' ? '媒体管理' : matchedEntry.category === 'settings' ? '系统设置' : matchedEntry.category === 'categories' ? '分类管理' : matchedEntry.category === 'tags' ? '标签管理' : matchedEntry.category === 'performance' ? '系统性能' : matchedEntry.category === 'ai' ? 'AI助手' : matchedEntry.category === 'designer' ? '设计器' : matchedEntry.category === 'profile' ? '个人资料' : matchedEntry.category === 'auth' ? '认证登录' : matchedEntry.category === 'permissions' ? '权限管理' : matchedEntry.category.charAt(0).toUpperCase() + matchedEntry.category.slice(1)}\n\n${matchedEntry.description}`;
                if (matchedEntry.steps && matchedEntry.steps.length > 0) {
                    responseText += '\n\n#### 操作步骤\n';
                    for (const step of matchedEntry.steps) {
                        responseText += `\n${step}`;
                    }
                }
                if (matchedEntry.relatedTopics && matchedEntry.relatedTopics.length > 0) {
                    responseText += '\n\n#### 相关主题\n';
                    responseText += matchedEntry.relatedTopics.join('、');
                }
            } else {
                // 无匹配结果时的默认回复
                responseText = '抱歉，我暂时无法回答这个问题。您可以尝试问我关于博客管理的其他问题，例如：\n\n- 文章管理\n- 评论审核\n- SEO优化\n- 用户管理\n- 媒体库\n- 系统设置\n- 分类管理\n- 标签管理';
            }
        } else {
            // 使用外部AI API
            responseText = await callExternalAI(text);
        }

        // 返回AI响应
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: responseText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    };

    const quickActions = [
        { icon: BarChart2, label: '查看仪表盘', action: '如何查看仪表盘数据' },
        { icon: PenTool, label: '写文章', action: '如何写文章' },
        { icon: SearchIcon, label: 'SEO 优化', action: '如何优化 SEO' },
        { icon: FileText, label: '管理文章', action: '如何管理文章' },
        { icon: MessageSquare, label: '管理评论', action: '如何管理评论' },
        { icon: Users, label: '管理用户', action: '如何管理用户' },
        { icon: Image, label: '媒体库', action: '如何使用媒体库' },
        { icon: FolderTree, label: '分类管理', action: '如何管理分类' },
        { icon: Tag, label: '标签管理', action: '如何管理标签' },
        { icon: Settings, label: '系统设置', action: '如何使用系统设置' },
    ];

    return (
        <>
            {/* Floating Trigger Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 flex items-center justify-center z-50 group"
                    >
                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-black" />

                        {/* Tooltip */}
                        <div className="absolute right-full mr-4 px-3 py-1.5 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md">
                            AI 助手
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            width: isExpanded ? '600px' : '380px',
                            height: isExpanded ? '80vh' : '600px'
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-8 right-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 flex flex-col overflow-hidden"
                        style={{
                            maxHeight: 'calc(100vh - 64px)',
                            maxWidth: 'calc(100vw - 64px)'
                        }}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">AI 智能助手</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
                                >
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-gray-500 hover:text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black/20">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai'
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                        }`}>
                                        {msg.role === 'ai' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                                    </div>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-neutral-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                                        }`}>
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length < 3 && (
                            <div className="px-4 py-2 flex gap-2">
                                {quickActions.slice(0, 3).map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSend(action.action)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors whitespace-nowrap"
                                    >
                                        <action.icon className="w-3 h-3" />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-gray-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="输入您的问题..."
                                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all text-gray-900 dark:text-white placeholder-gray-500"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
