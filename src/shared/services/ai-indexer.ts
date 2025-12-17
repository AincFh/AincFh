import { aiDatabase } from './ai-database';

/**
 * AI索引管理器，负责优化文本索引和搜索功能
 */
class AIIndexer {
  // 索引更新队列
  private updateQueue: Array<{
    type: 'article' | 'vocabulary';
    id: string;
    content?: string;
  }> = [];

  // 批处理定时器
  private batchTimer: NodeJS.Timeout | null = null;

  // 索引配置
  private readonly config = {
    batchSize: 10,
    batchDelay: 1000, // 1秒批处理延迟
    minKeywordLength: 2,
    maxKeywordsPerDocument: 100,
    similarityThreshold: 0.7 // 文本相似度阈值
  };

  /**
   * 初始化索引器
   */
  async initialize(): Promise<void> {
    // 确保数据库已初始化
    await aiDatabase.init();

    console.log('AI索引管理器已初始化');
  }

  /**
   * 索引一篇文章
   * @param articleId 文章ID
   * @param content 文章内容
   */
  queueArticleIndex(articleId: string, content: string): void {
    // 添加到更新队列
    this.updateQueue.push({
      type: 'article',
      id: articleId,
      content
    });

    // 触发批处理
    this.scheduleBatchUpdate();
  }

  /**
   * 索引一个词汇
   * @param wordId 词汇ID
   */
  queueVocabularyIndex(wordId: string): void {
    // 添加到更新队列
    this.updateQueue.push({
      type: 'vocabulary',
      id: wordId
    });

    // 触发批处理
    this.scheduleBatchUpdate();
  }

  /**
   * 安排批处理更新
   */
  private scheduleBatchUpdate(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processUpdateBatch();
    }, this.config.batchDelay);
  }

  /**
   * 处理索引更新批处理
   */
  private async processUpdateBatch(): Promise<void> {
    if (this.updateQueue.length === 0) return;

    // 获取当前批次
    const batch = this.updateQueue.splice(0, this.config.batchSize);

    try {
      for (const item of batch) {
        if (item.type === 'article' && item.content) {
          await this.indexArticle(item.id, item.content);
        } else if (item.type === 'vocabulary') {
          await this.indexVocabulary(item.id);
        }
      }
    } catch (error) {
      console.error('索引批处理失败:', error);
      // 将失败的项目重新加入队列
      this.updateQueue = [...batch, ...this.updateQueue];
    }

    // 如果还有待处理项，继续处理
    if (this.updateQueue.length > 0) {
      this.scheduleBatchUpdate();
    }
  }

  /**
   * 索引文章内容
   */
  private async indexArticle(articleId: string, content: string): Promise<void> {
    // 提取关键词（增强版）
    const keywords = this.extractEnhancedKeywords(content);

    // 更新文章索引
    // 这里会通过aiDatabase的方法来更新索引
    // 在实际应用中，可能需要更复杂的索引更新逻辑
  }

  /**
   * 索引词汇
   */
  private async indexVocabulary(wordId: string): Promise<void> {
    // 获取词汇详情
    // 更新词汇相关索引
    // 在实际应用中实现
  }

  /**
   * 增强版关键词提取
   */
  private extractEnhancedKeywords(text: string): Array<{ keyword: string; score: number }> {
    // 1. 基础分词
    const words = this.tokenizeText(text);

    // 2. 计算词频
    const wordFreq = new Map<string, number>();
    for (const word of words) {
      // 过滤短词
      if (word.length < this.config.minKeywordLength) continue;

      // 过滤停用词
      if (this.isStopWord(word)) continue;

      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }

    // 3. 计算TF-IDF得分（简化版）
    // 注意：这里使用简化的TF计算，实际应用中应使用完整的TF-IDF
    const totalWords = words.length;
    const scoredKeywords = Array.from(wordFreq.entries())
      .map(([keyword, freq]) => ({
        keyword,
        score: freq / totalWords // 简单TF计算
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxKeywordsPerDocument);

    return scoredKeywords;
  }

  /**
   * 文本分词
   */
  private tokenizeText(text: string): string[] {
    // 基础分词实现
    // 在实际应用中应使用更专业的分词库
    return text
      .toLowerCase()
      .replace(/[.,?!;:"\'\(\)\[\]{}]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * 检查是否为停用词
   */
  private isStopWord(word: string): boolean {
    // 扩展的停用词列表
    const stopWords = new Set([
      // 中文停用词
      '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你',
      '会', '着', '没有', '看', '好', '自己', '这', '那', '他', '她', '它', '们', '来', '到', '过', '为', '以', '与', '而', '则',
      '但', '如果', '因为', '所以', '虽然', '但是', '然而', '不仅', '而且', '或者', '还是', '即使', '既然', '因此', '于是', '对于',

      // 英文停用词
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'for', 'on', 'with', 'by', 'at',
      'from', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'before',
      'under', 'around', 'above', 'below', 'would', 'should', 'could', 'might', 'must', 'shall', 'will', 'can', 'may'
    ]);

    return stopWords.has(word);
  }

  /**
   * 执行高级搜索
   */
  async advancedSearch(query: string, options: {
    limit?: number;
    includeVocabulary?: boolean;
    boostRecent?: boolean;
  } = {}): Promise<any[]> {
    // 默认选项
    const { limit = 10, includeVocabulary = true, boostRecent = true } = options;

    // 预处理查询
    const processedQuery = this.preprocessQuery(query);

    // 提取查询关键词
    const queryKeywords = this.extractEnhancedKeywords(processedQuery)
      .map(item => item.keyword);

    // 搜索文章
    const articles = await aiDatabase.searchArticlesByKeywords(
      queryKeywords,
      limit
    );

    // 如果需要，搜索词汇
    let vocabularyResults: any[] = [];
    if (includeVocabulary) {
      vocabularyResults = await this.searchRelatedVocabulary(queryKeywords);
    }

    // 合并结果（根据需求实现排序逻辑）
    const results = this.mergeAndRankResults(articles, vocabularyResults, queryKeywords, {
      boostRecent
    });

    return results.slice(0, limit);
  }

  /**
   * 预处理查询文本
   */
  private preprocessQuery(query: string): string {
    // 去除多余空格、特殊字符等
    return query
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  /**
   * 搜索相关词汇
   */
  private async searchRelatedVocabulary(keywords: string[]): Promise<any[]> {
    const results: any[] = [];

    for (const keyword of keywords) {
      // 查找完全匹配
      const exactMatch = await aiDatabase.findVocabulary(keyword);
      if (exactMatch) {
        results.push({
          type: 'vocabulary',
          data: exactMatch,
          relevance: 1.0 // 完全匹配相关度为1
        });
      }

      // 查找相似词汇（简化实现，实际应用中应使用更复杂的算法）
      // 这里可以通过模糊匹配或语义相似度来实现
    }

    return results;
  }

  /**
   * 合并并排序搜索结果
   */
  private mergeAndRankResults(
    articles: any[],
    vocabulary: any[],
    queryKeywords: string[],
    options: { boostRecent: boolean }
  ): any[] {
    const { boostRecent } = options;

    // 为文章添加类型和相关度评分
    const scoredArticles = articles.map(article => {
      // 计算基础相关度
      const relevance = this.calculateRelevance(article.keywords, queryKeywords);

      // 计算时间因子（最近的文章获得更高分数）
      let timeFactor = 1.0;
      if (boostRecent && article.date) {
        const articleDate = new Date(article.date).getTime();
        const now = Date.now();
        const daysSincePublication = (now - articleDate) / (1000 * 60 * 60 * 24);
        // 随时间衰减的因子，30天后开始明显衰减
        timeFactor = Math.max(0.5, Math.exp(-daysSincePublication / 100));
      }

      return {
        type: 'article',
        data: article,
        relevance: relevance * timeFactor
      };
    });

    // 合并所有结果并排序
    return [...scoredArticles, ...vocabulary]
      .sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * 计算相关度分数
   */
  private calculateRelevance(docKeywords: string[], queryKeywords: string[]): number {
    if (!docKeywords.length || !queryKeywords.length) return 0;

    // 计算交集
    const intersection = docKeywords.filter(keyword =>
      queryKeywords.includes(keyword)
    );

    // 简单的Jaccard相似度
    return intersection.length / Math.sqrt(docKeywords.length * queryKeywords.length);
  }

  /**
   * 重建所有索引
   */
  async rebuildAllIndexes(): Promise<void> {
    console.log('开始重建所有索引...');

    try {
      // 获取所有文章
      const articles = await aiDatabase.getAllArticles();

      // 重新索引每篇文章
      for (const article of articles) {
        this.queueArticleIndex(article.id, article.title + ' ' + article.content);
      }

      // 这里可以添加词汇索引重建逻辑

      console.log(`成功重建 ${articles.length} 篇文章的索引`);
    } catch (error) {
      console.error('索引重建失败:', error);
      throw error;
    }
  }

  /**
   * 获取热门搜索关键词
   */
  async getPopularKeywords(limit: number = 20): Promise<Array<{ keyword: string; count: number }>> {
    // 在实际应用中，应从数据库中查询热门关键词
    // 这里提供一个简化实现
    return [];
  }

  /**
   * 提供搜索建议
   */
  async getSearchSuggestions(prefix: string, limit: number = 5): Promise<string[]> {
    if (!prefix || prefix.length < 2) return [];

    // 在实际应用中，应从词汇表和热门关键词中查询建议
    // 这里提供一个简化实现
    return [];
  }

  /**
   * 清理旧索引数据
   */
  async cleanupOldIndexes(maxAgeInDays: number = 90): Promise<void> {
    // 计算截止日期
    const cutoffDate = Date.now() - (maxAgeInDays * 24 * 60 * 60 * 1000);

    // 在实际应用中，删除过期的索引数据
    // 这里提供一个简化实现
    console.log(`清理 ${maxAgeInDays} 天前的索引数据`);
  }
}

// 导出单例实例
export const aiIndexer = new AIIndexer();

export default AIIndexer;