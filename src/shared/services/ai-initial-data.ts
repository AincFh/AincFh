import { aiAssistantDB } from './ai-assistant-db';

// 初始化示例数据
const EXAMPLE_ARTICLES = [
  {
    id: 'article-1',
    title: '人工智能在日常生活中的应用',
    content: '人工智能技术已经广泛应用于我们的日常生活中。从智能手机的语音助手到智能家居设备，AI正在改变我们与技术交互的方式。推荐系统根据我们的喜好提供个性化内容，而智能客服则能够解答我们的问题。随着技术的不断发展，AI将在医疗健康、交通出行等更多领域发挥重要作用。',
    tags: ['人工智能', '日常生活', '技术应用'],
    source: '本地知识库示例',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'article-2',
    title: '健康生活方式的重要性',
    content: '保持健康的生活方式对我们的身心健康至关重要。均衡的饮食、充足的睡眠和规律的运动是健康生活的三大支柱。研究表明，健康的生活方式可以降低慢性疾病的风险，提高生活质量，延长寿命。此外，心理健康同样重要，我们应该学会管理压力，保持积极的心态。',
    tags: ['健康', '生活方式', '养生'],
    source: '本地知识库示例',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'article-3',
    title: '学习编程的入门指南',
    content: '学习编程是一项有价值的技能，特别是在当今数字化的世界中。初学者可以从Python、JavaScript等相对简单的语言开始。重要的是要理解基本概念，如变量、函数、条件语句和循环。通过实际项目练习是掌握编程的最佳方式，可以从简单的小程序开始，逐渐过渡到更复杂的项目。记住，编程是一项需要不断实践和学习的技能。',
    tags: ['编程', '学习', '入门'],
    source: '本地知识库示例',
    createdAt: new Date().toISOString(),
  },
];

// 初始化示例词汇
const EXAMPLE_VOCABULARY = [
  { word: '人工智能', weight: 1.2, synonyms: ['AI', '智能系统', '机器学习'], category: '技术' },
  { word: '健康', weight: 1.0, synonyms: ['养生', '保健', '身体状况'], category: '生活' },
  { word: '编程', weight: 1.1, synonyms: ['编码', '软件开发', '计算机编程'], category: '技术' },
  { word: '学习', weight: 0.9, synonyms: ['教育', '培训', '研究'], category: '通用' },
  { word: '生活方式', weight: 0.8, synonyms: ['生活习惯', '日常行为', '生活模式'], category: '生活' },
];

// 初始化数据库示例数据
export async function initializeExampleData() {
  try {
    // 初始化数据库管理器
    await aiAssistantDB.initialize();

    // 获取数据库统计信息
    const stats = await aiAssistantDB.getStats();

    // 如果数据库为空，则添加示例数据
    if (stats.articles === 0) {
      console.log('开始初始化示例数据...');

      // 添加示例文章
      for (const article of EXAMPLE_ARTICLES) {
        await aiAssistantDB.addOrUpdateArticle(article);
      }

      // 示例词汇可以通过其他方式添加或通过词汇增强器处理
      console.log('示例数据初始化完成!');
      return true;
    }

    return false;
  } catch (error) {
    console.error('初始化示例数据失败:', error);
    return false;
  }
}

// 获取推荐的搜索关键词
export function getRecommendedSearchTerms() {
  return ['人工智能应用', '健康生活技巧', '编程学习方法', '日常效率提升', '智能技术趋势'];
}