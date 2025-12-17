import { aiDatabase } from './ai-database';
import { aiIndexer } from './ai-indexer';
import { aiCache } from './ai-cache';
import { aiDataImporter } from './ai-data-importer';
import { aiVocabularyEnhancer } from './ai-vocabulary-enhancer';

/**
 * AI助手数据库管理器
 * 整合所有数据库相关服务，提供统一的初始化和访问入口
 */
class AI_assistant_db_manager {
  // 初始化状态
  private initialized = false;

  // 初始化锁，防止并发初始化
  private initializationLock = false;

  // 初始化完成的Promise
  private initializationPromise: Promise<void> | null = null;

  /**
   * 初始化所有数据库服务
   */
  async initialize(): Promise<void> {
    // 如果已经初始化，直接返回
    if (this.initialized) {
      return;
    }

    // 使用锁防止并发初始化
    if (this.initializationLock) {
      // 如果已经有初始化Promise在进行中，等待其完成
      if (this.initializationPromise) {
        return this.initializationPromise;
      }
    }

    // 设置锁
    this.initializationLock = true;

    try {
      console.log('开始初始化AI助手数据库...');

      // 创建初始化Promise
      this.initializationPromise = this.performInitialization();

      // 等待初始化完成
      await this.initializationPromise;

      this.initialized = true;
      console.log('AI助手数据库初始化完成');
    } catch (error) {
      console.error('AI助手数据库初始化失败:', error);
      throw error;
    } finally {
      // 释放锁
      this.initializationLock = false;
      this.initializationPromise = null;
    }
  }

  /**
   * 执行实际的初始化操作
   */
  private async performInitialization(): Promise<void> {
    // 按依赖顺序初始化服务

    // 1. 初始化基础数据库
    await aiDatabase.init();

    // 2. 缓存服务已通过构造函数初始化，无需额外初始化

    // 3. 初始化索引器
    await aiIndexer.initialize();

    // 4. 初始化词汇增强器
    await aiVocabularyEnhancer.initialize();

    // 5. 初始化数据导入器
    await aiDataImporter.initialize();

    // 检查是否需要执行首次数据导入
    await this.checkFirstTimeImport();
  }

  /**
   * 检查并执行首次数据导入
   */
  private async checkFirstTimeImport(): Promise<void> {
    const firstTimeImported = localStorage.getItem('ai_first_time_import_complete');

    if (!firstTimeImported) {
      console.log('检测到首次启动，准备执行初始数据导入...');

      try {
        // 执行初始导入（使用模拟数据，避免依赖外部API）
        const stats = await aiDataImporter.importAllArticlesFromAPI();

        // 检查导入是否成功
        if (stats.imported > 0 || stats.skipped > 0) {
          localStorage.setItem('ai_first_time_import_complete', 'true');
          console.log('初始数据导入完成');
        }
      } catch (error) {
        console.error('初始数据导入失败:', error);
        // 首次导入失败不阻止系统启动
      }
    }
  }

  /**
   * 执行数据库搜索
   */
  async search(query: string, options?: {
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'popularity';
    categories?: string[];
    languages?: ('zh' | 'en')[];
    expandQuery?: boolean;
  }): Promise<any[]> {
    await this.ensureInitialized();

    const {
      limit = 10,
      sortBy = 'relevance',
      expandQuery = true
    } = options || {};

    try {
      // 尝试从缓存获取结果
      const cacheKey = this.generateSearchCacheKey(query, options);
      const cachedResults = await aiCache.getSearchCache(cacheKey);

      if (cachedResults) {
        console.log('从缓存获取搜索结果');
        return cachedResults;
      }

      // 如果启用了查询扩展，扩展查询词
      let searchTerms = [query];

      if (expandQuery) {
        const expandedTerms = await aiVocabularyEnhancer.expandQuery(query);
        searchTerms = expandedTerms;
      }

      // 执行搜索
      let results = await aiIndexer.advancedSearch(searchTerms.join(' '), {
        limit,
        boostRecent: sortBy === 'date'
      });

      // 应用过滤条件
      if (options?.categories && options.categories.length > 0) {
        results = results.filter(item =>
          item.category && options.categories!.includes(item.category)
        );
      }

      // 限制结果数量
      results = results.slice(0, limit);

      // 缓存结果
      await aiCache.setSearchCache(cacheKey, results);

      return results;
    } catch (error) {
      console.error('搜索失败:', error);
      throw error;
    }
  }

  /**
   * 生成搜索缓存键
   */
  private generateSearchCacheKey(query: string, options?: any): string {
    const keyParts = [`search:${query}`];

    if (options) {
      if (options.limit) keyParts.push(`limit:${options.limit}`);
      if (options.sortBy) keyParts.push(`sort:${options.sortBy}`);
      if (options.categories && options.categories.length > 0) {
        keyParts.push(`cats:${options.categories.sort().join(',')}`);
      }
      if (options.languages && options.languages.length > 0) {
        keyParts.push(`langs:${options.languages.sort().join(',')}`);
      }
      if (options.expandQuery !== undefined) {
        keyParts.push(`expand:${options.expandQuery}`);
      }
    }

    return keyParts.join('|');
  }

  /**
   * 获取文章详情
   */
  async getArticleById(id: string): Promise<any> {
    await this.ensureInitialized();

    try {
      // 尝试从缓存获取
      const cachedArticle = await aiCache.getArticleCache(id);

      if (cachedArticle) {
        return cachedArticle;
      }

      // 从数据库获取
      const article = await aiDatabase.getArticleById(id);

      // 更新缓存
      if (article) {
        await aiCache.setArticleCache(id, article);
      }

      return article;
    } catch (error) {
      console.error(`获取文章 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 添加或更新文章
   */
  async addOrUpdateArticle(article: any): Promise<void> {
    await this.ensureInitialized();

    try {
      // 更新数据库
      await aiDatabase.addOrUpdateArticle(article);

      // 更新缓存
      await aiCache.setArticleCache(article.id, article);

      // 更新索引
      await aiIndexer.queueArticleIndex(article.id, article.title + ' ' + article.content);

      // 清除相关搜索缓存
      await aiCache.clearSearchCache();

      // 分析文章中的词汇
      await this.analyzeArticleVocabulary(article);
    } catch (error) {
      console.error(`添加或更新文章失败:`, error);
      throw error;
    }
  }

  /**
   * 分析文章词汇
   */
  private async analyzeArticleVocabulary(article: any): Promise<void> {
    try {
      // 分析文章内容
      const textToAnalyze = `${article.title} ${article.content}`;
      const analysis = await aiVocabularyEnhancer.analyzeText(textToAnalyze);

      // 如果启用了自动增强，应用高置信度的建议
      if (aiVocabularyEnhancer.getConfig().enableAutoEnhancement) {
        const highConfidenceSuggestions = analysis.suggestions.filter(s => s.confidence >= 0.7);

        if (highConfidenceSuggestions.length > 0) {
          await aiVocabularyEnhancer.applySuggestions(highConfidenceSuggestions);
        }
      }
    } catch (error) {
      console.error('分析文章词汇失败:', error);
      // 不影响主流程
    }
  }

  /**
   * 导入数据
   */
  async importData(options?: {
    source?: 'api' | 'json';
    jsonData?: string;
    batchSize?: number;
    updateExisting?: boolean;
    rebuildIndex?: boolean;
  }): Promise<any> {
    await this.ensureInitialized();

    try {
      if (options?.source === 'json' && options.jsonData) {
        // 从JSON导入
        return await aiDataImporter.importFromJson(options.jsonData, {
          batchSize: options.batchSize,
          updateExisting: options.updateExisting,
          rebuildIndex: options.rebuildIndex
        });
      } else {
        // 从API导入
        return await aiDataImporter.importAllArticlesFromAPI({
          batchSize: options?.batchSize,
          updateExisting: options?.updateExisting ?? true,
          rebuildIndex: options?.rebuildIndex ?? true
        });
      }
    } catch (error) {
      console.error('数据导入失败:', error);
      throw error;
    }
  }

  /**
   * 执行数据库优化
   */
  async optimizeDatabase(): Promise<{
    vocabulary: any;
    index: any;
    cache: any;
  }> {
    await this.ensureInitialized();

    try {
      console.log('开始执行数据库优化...');

      // 优化词汇库
      const vocabularyResult = await aiVocabularyEnhancer.optimizeVocabulary();

      // 重建索引
      await aiIndexer.rebuildAllIndexes();

      // 缓存已通过内部LRU扫描器定期清理，无需额外操作

      console.log('数据库优化完成');

      return {
        vocabulary: vocabularyResult,
        index: { rebuilt: true },
        cache: { clearedExpired: true }
      };
    } catch (error) {
      console.error('数据库优化失败:', error);
      throw error;
    }
  }

  /**
   * 导出数据库
   */
  async exportDatabase(format: 'json' = 'json'): Promise<string> {
    await this.ensureInitialized();

    try {
      // 导出文章数据
      const articlesExport = await aiDataImporter.exportData(format);

      // 导出词汇数据
      const vocabularyExport = await aiVocabularyEnhancer.exportVocabulary(format);

      // 合并导出数据
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        articles: JSON.parse(articlesExport),
        vocabulary: JSON.parse(vocabularyExport)
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('数据库导出失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据库统计信息
   */
  async getStats(): Promise<{
    articles: number;
    vocabularyItems: number;
    vocabularySets: number;
    searchCacheSize: number;
    articleCacheSize: number;
    lastImport?: number;
  }> {
    await this.ensureInitialized();

    try {
       // 获取数据库统计信息
       const dbStats = await aiDatabase.getStats();
      // 获取缓存统计信息
      const cacheStats = await aiCache.getStats();

      const articlesCount = dbStats.articleCount;
      const vocabularyCount = dbStats.vocabularyCount;
      const vocabularySetsCount = 0; // 词汇集计数暂不支持

      const lastImportStr = localStorage.getItem('ai_last_update_timestamp');
      const lastImport = lastImportStr ? parseInt(lastImportStr, 10) : undefined;

      return {
        articles: articlesCount,
        vocabularyItems: vocabularyCount,
        vocabularySets: vocabularySetsCount,
        searchCacheSize: cacheStats.memoryCacheSize,
        articleCacheSize: cacheStats.memoryCacheItems,
        lastImport
      };
    } catch (error) {
      console.error('获取数据库统计失败:', error);
      throw error;
    }
  }

  /**
   * 重置数据库（谨慎使用）
   */
  async resetDatabase(confirm: boolean = false): Promise<void> {
    if (!confirm) {
      throw new Error('重置数据库需要确认参数');
    }

    try {
      console.log('开始重置数据库...');

      // 清除所有数据
      await aiDatabase.clearAll();

      // 清除缓存
      await aiCache.clearAll();

      // 重新初始化
      await this.performInitialization();

      // 清除本地存储标记
      localStorage.removeItem('ai_first_time_import_complete');
      localStorage.removeItem('ai_last_update_timestamp');
      localStorage.removeItem('ai_vocabulary_initialized');

      console.log('数据库重置完成');
    } catch (error) {
      console.error('数据库重置失败:', error);
      throw error;
    }
  }

  /**
   * 确保已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * 获取各服务实例
   */
  get services() {
    return {
      database: aiDatabase,
      indexer: aiIndexer,
      cache: aiCache,
      dataImporter: aiDataImporter,
      vocabularyEnhancer: aiVocabularyEnhancer
    };
  }

  /**
   * 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// 导出单例实例
export const aiAssistantDB = new AI_assistant_db_manager();

export default AI_assistant_db_manager;