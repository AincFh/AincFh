import { Post } from '../types';
import { aiDatabase } from './ai-database';
import { aiIndexer } from './ai-indexer';
import { aiCache } from './ai-cache';

// 导入状态
interface ImportStats {
  total: number;
  imported: number;
  failed: number;
  skipped: number;
  startTime: number;
  endTime?: number;
}

// 导入选项
interface ImportOptions {
  batchSize?: number;
  skipExisting?: boolean;
  updateExisting?: boolean;
  clearCache?: boolean;
  rebuildIndex?: boolean;
}

// 导入错误
interface ImportError {
  id: string;
  type: 'article' | 'vocabulary';
  error: string;
  timestamp: number;
}

/**
 * AI数据导入管理器
 */
class AI_data_importer {
  // 导入队列
  private importQueue: Array<{
    type: 'article' | 'vocabulary';
    data: any;
  }> = [];

  // 当前导入状态
  private currentImportStats: ImportStats | null = null;

  // 导入错误列表
  private importErrors: ImportError[] = [];

  // 导入配置
  private config = {
    defaultBatchSize: 50,
    maxConcurrentImports: 3,
    retryCount: 3,
    importTimeout: 30000, // 30秒
    autoSyncEnabled: false,
    autoSyncInterval: 24 * 60 * 60 * 1000, // 24小时
    apiEndpoint: '/api/posts',
  };

  // 自动同步定时器
  private autoSyncTimer: NodeJS.Timeout | null = null;

  /**
   * 初始化导入器
   */
  async initialize(): Promise<void> {
    // 确保数据库已初始化
    await aiDatabase.init();

    // 初始化索引器
    await aiIndexer.initialize();

    // 如果启用了自动同步，启动定时任务
    if (this.config.autoSyncEnabled) {
      this.startAutoSync();
    }

    console.log('AI数据导入管理器已初始化');
  }

  /**
   * 从API导入所有文章
   */
  async importAllArticlesFromAPI(options: ImportOptions = {}): Promise<ImportStats> {
    // 设置默认选项
    const {
      batchSize = this.config.defaultBatchSize,
      skipExisting = true,
      updateExisting = true,
      clearCache = true,
      rebuildIndex = true
    } = options;

    // 初始化导入状态
    this.currentImportStats = {
      total: 0,
      imported: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now()
    };

    // 清空导入错误列表
    this.importErrors = [];

    try {
      console.log('开始从API导入文章...');

      // 获取所有文章（支持分页）
      const allArticles = await this.fetchAllArticlesFromAPI();
      this.currentImportStats.total = allArticles.length;

      console.log(`发现 ${allArticles.length} 篇文章待导入`);

      // 批量导入
      const batches = this.createBatches(allArticles, batchSize);

      for (let i = 0; i < batches.length; i++) {
        console.log(`导入批次 ${i + 1}/${batches.length}，每批 ${batches[i].length} 篇文章`);

        await this.importArticleBatch(batches[i], {
          skipExisting,
          updateExisting
        });
      }

      // 如果需要，重建索引
      if (rebuildIndex && this.currentImportStats.imported > 0) {
        console.log('开始重建索引...');
        await aiIndexer.rebuildAllIndexes();
        console.log('索引重建完成');
      }

      // 如果需要，清除缓存
      if (clearCache) {
        console.log('清除缓存...');
        await aiCache.clearSearchCache();
      }

      console.log(`文章导入完成: 成功 ${this.currentImportStats.imported}, 失败 ${this.currentImportStats.failed}, 跳过 ${this.currentImportStats.skipped}`);
    } catch (error) {
      console.error('文章导入失败:', error);
      this.currentImportStats.failed = this.currentImportStats.total - this.currentImportStats.imported - this.currentImportStats.skipped;
    } finally {
      this.currentImportStats.endTime = Date.now();
    }

    return { ...this.currentImportStats };
  }

  /**
   * 从API获取所有文章
   */
  private async fetchAllArticlesFromAPI(): Promise<Post[]> {
    const articles: Post[] = [];
    let page = 1;
    let hasMore = true;
    const pageSize = 100; // API分页大小

    try {
      while (hasMore) {
        const response = await fetch(`${this.config.apiEndpoint}?page=${page}&pageSize=${pageSize}`);

        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();

        // 假设API返回格式 { items: Post[], total: number, page: number, pageSize: number }
        if (data.items && Array.isArray(data.items)) {
          articles.push(...data.items);

          // 检查是否还有更多页
          hasMore = articles.length < (data.total || 0);
          page++;
        } else {
          hasMore = false;
        }

        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
      // 如果API调用失败，尝试使用模拟数据（在开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.log('尝试使用模拟数据...');
        return this.getMockArticles();
      }
    }

    return articles;
  }

  /**
   * 创建批次
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * 批量导入文章
   */
  private async importArticleBatch(
    articles: Post[],
    options: { skipExisting: boolean; updateExisting: boolean }
  ): Promise<void> {
    const { skipExisting, updateExisting } = options;

    for (const article of articles) {
      try {
        // 检查文章是否已存在
        const existingArticle = await aiDatabase.getArticleById(article.id);

        if (existingArticle) {
          if (updateExisting) {
            // 检查是否需要更新（比较更新时间或内容哈希）
            const needsUpdate = this.needsUpdate(existingArticle, article);

            if (needsUpdate) {
              await this.importArticle(article);
              this.currentImportStats!.imported++;
            } else {
              this.currentImportStats!.skipped++;
            }
          } else if (skipExisting) {
            this.currentImportStats!.skipped++;
          }
        } else {
          // 导入新文章
          await this.importArticle(article);
          this.currentImportStats!.imported++;
        }
      } catch (error) {
        console.error(`导入文章失败 ${article.id}:`, error);
        this.currentImportStats!.failed++;

        // 记录错误
        this.importErrors.push({
          id: article.id,
          type: 'article',
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * 导入单篇文章
   */
  private async importArticle(article: Post): Promise<void> {
    // 添加到数据库
    await aiDatabase.addOrUpdateArticle(article);

    // 更新缓存
    await aiCache.setArticleCache(article.id, article);

    // 将文章添加到索引队列
    aiIndexer.queueArticleIndex(article.id, article.title + ' ' + article.content);
  }

  /**
   * 检查文章是否需要更新
   */
  private needsUpdate(existing: any, newArticle: Post): boolean {
    // 简单实现：比较更新时间或内容是否有变化
    // 实际应用中应使用更复杂的比较逻辑或内容哈希
    if (existing.updatedAt && newArticle.updatedAt) {
      return new Date(newArticle.updatedAt).getTime() > new Date(existing.updatedAt).getTime();
    }

    // 如果没有更新时间，比较内容摘要
    return JSON.stringify(existing.title + existing.content) !== JSON.stringify(newArticle.title + newArticle.content);
  }

  /**
   * 获取模拟文章数据（开发环境使用）
   */
  private getMockArticles(): Post[] {
    return [
      {
        id: 'mock-1',
        title: '人工智能基础知识介绍',
        slug: 'ai-fundamentals',
        content: '人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支，它尝试模拟、延伸和扩展人的智能。AI的研究领域包括机器学习、自然语言处理、计算机视觉等。近年来，随着深度学习技术的发展，AI在各个领域都取得了突破性进展。',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        status: 'published',
        authorId: 'author1',
        author: { id: 'author1', username: 'AI专家', avatar: 'https://picsum.photos/seed/author1/100/100.jpg' },
        categories: [],
        tags: [
          { id: 'tag-ai', name: '人工智能', slug: 'artificial-intelligence', createdAt: new Date() },
          { id: 'tag-ml', name: '机器学习', slug: 'machine-learning', createdAt: new Date() },
          { id: 'tag-dl', name: '深度学习', slug: 'deep-learning', createdAt: new Date() }
        ]
      },
      {
        id: 'mock-2',
        title: 'Next.js框架入门教程',
        slug: 'nextjs-tutorial',
        content: 'Next.js是一个基于React的全栈框架，它提供了服务器端渲染、静态网站生成、API路由等功能。本教程将介绍Next.js的基本概念、安装配置以及核心特性，帮助开发者快速上手这个强大的框架。',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        status: 'published',
        authorId: 'author2',
        author: { id: 'author2', username: '前端开发者', avatar: 'https://picsum.photos/seed/author2/100/100.jpg' },
        categories: [],
        tags: [
          { id: 'tag-nextjs', name: 'Next.js', slug: 'next-js', createdAt: new Date() },
          { id: 'tag-react', name: 'React', slug: 'react', createdAt: new Date() },
          { id: 'tag-frontend', name: '前端框架', slug: 'frontend-framework', createdAt: new Date() }
        ]
      },
      {
        id: 'mock-3',
        title: '数据库性能优化指南',
        slug: 'database-optimization',
        content: '数据库性能对应用程序的整体性能有着至关重要的影响。本文将介绍数据库优化的基本原则，包括索引设计、查询优化、缓存策略等方面的最佳实践，帮助开发者构建高性能的数据访问层。',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        status: 'published',
        authorId: 'author3',
        author: { id: 'author3', username: '数据库专家', avatar: 'https://picsum.photos/seed/author3/100/100.jpg' },
        categories: [],
        tags: [
          { id: 'tag-database', name: '数据库', slug: 'database', createdAt: new Date() },
          { id: 'tag-performance', name: '性能优化', slug: 'performance-optimization', createdAt: new Date() },
          { id: 'tag-sql', name: 'SQL', slug: 'sql', createdAt: new Date() }
        ]
      }
    ];
  }

  /**
   * 增量更新文章
   */
  async incrementalUpdate(options: ImportOptions = {}): Promise<ImportStats> {
    // 记录上次更新时间
    const lastUpdateKey = 'ai_last_update_timestamp';
    const lastUpdateTime = localStorage.getItem(lastUpdateKey);

    console.log(`开始增量更新，上次更新时间: ${lastUpdateTime || '从未更新'}`);

    // 执行增量更新（这里简化实现，实际应该只获取上次更新后的新文章）
    const stats = await this.importAllArticlesFromAPI({...options, skipExisting: true});

    // 更新上次更新时间
    localStorage.setItem(lastUpdateKey, Date.now().toString());

    return stats;
  }

  /**
   * 手动导入单篇文章
   */
  async importSingleArticle(article: Post): Promise<boolean> {
    try {
      await this.importArticle(article);
      return true;
    } catch (error) {
      console.error('导入单篇文章失败:', error);
      return false;
    }
  }

  /**
   * 删除文章
   */
  async deleteArticle(articleId: string): Promise<boolean> {
    try {
      // 注意：这里需要在aiDatabase中添加deleteArticle方法
      // await aiDatabase.deleteArticle(articleId);

      // 清除缓存
      await aiCache.remove('article', articleId);

      // 从搜索缓存中移除相关内容
      await aiCache.clearSearchCache();

      return true;
    } catch (error) {
      console.error(`删除文章失败 ${articleId}:`, error);
      return false;
    }
  }

  /**
   * 启动自动同步
   */
  startAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
    }

    this.autoSyncTimer = setInterval(async () => {
      console.log('执行自动同步...');
      try {
        await this.incrementalUpdate();
      } catch (error) {
        console.error('自动同步失败:', error);
      }
    }, this.config.autoSyncInterval);

    console.log(`自动同步已启动，间隔 ${this.config.autoSyncInterval / (1000 * 60 * 60)} 小时`);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
      console.log('自动同步已停止');
    }
  }

  /**
   * 获取当前导入状态
   */
  getImportStatus(): ImportStats | null {
    return this.currentImportStats ? { ...this.currentImportStats } : null;
  }

  /**
   * 获取导入错误列表
   */
  getImportErrors(): ImportError[] {
    return [...this.importErrors];
  }

  /**
   * 重试失败的导入项
   */
  async retryFailedImports(): Promise<ImportStats> {
    if (this.importErrors.length === 0) {
      console.log('没有失败的导入项需要重试');
      return {
        total: 0,
        imported: 0,
        failed: 0,
        skipped: 0,
        startTime: Date.now(),
        endTime: Date.now()
      };
    }

    console.log(`开始重试 ${this.importErrors.length} 个失败的导入项`);

    // 初始化重试状态
    const retryStats: ImportStats = {
      total: this.importErrors.length,
      imported: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now()
    };

    // 保存错误列表的副本
    const errorsToRetry = [...this.importErrors];
    this.importErrors = [];

    for (const error of errorsToRetry) {
      try {
        if (error.type === 'article') {
          // 尝试重新获取并导入文章
          // 这里简化实现，实际应该有重试获取文章的逻辑
          console.log(`重试导入文章 ${error.id}`);
          // 由于没有实际的重新获取逻辑，这里直接标记为失败
          retryStats.failed++;
          this.importErrors.push(error);
        }
      } catch (retryError) {
        console.error(`重试失败 ${error.id}:`, retryError);
        retryStats.failed++;
        this.importErrors.push(error);
      }
    }

    retryStats.endTime = Date.now();
    return retryStats;
  }

  /**
   * 导出数据库内容
   */
  async exportData(format: 'json' = 'json'): Promise<string> {
    try {
      // 获取所有文章
      const articles = await aiDatabase.getAllArticles();

      const exportData = {
        exportDate: new Date().toISOString(),
        articleCount: articles.length,
        articles: articles
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('导出数据失败:', error);
      throw error;
    }
  }

  /**
   * 从JSON导入数据
   */
  async importFromJson(jsonString: string, options: ImportOptions = {}): Promise<ImportStats> {
    try {
      const data = JSON.parse(jsonString);

      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error('无效的导入数据格式');
      }

      // 使用批量导入功能导入文章
      this.currentImportStats = {
        total: data.articles.length,
        imported: 0,
        failed: 0,
        skipped: 0,
        startTime: Date.now()
      };

      this.importErrors = [];

      await this.importArticleBatch(data.articles, {
        skipExisting: options.skipExisting ?? true,
        updateExisting: options.updateExisting ?? true
      });

      this.currentImportStats.endTime = Date.now();

      // 如果需要，重建索引
      if (options.rebuildIndex && this.currentImportStats.imported > 0) {
        await aiIndexer.rebuildAllIndexes();
      }

      return { ...this.currentImportStats };
    } catch (error) {
      console.error('从JSON导入失败:', error);
      throw error;
    }
  }

  /**
   * 设置配置
   */
  setConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };

    // 如果更新了自动同步配置，重启自动同步
    if ('autoSyncEnabled' in newConfig || 'autoSyncInterval' in newConfig) {
      if (this.config.autoSyncEnabled) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
  }

  /**
   * 获取配置
   */
  getConfig(): typeof this.config {
    return { ...this.config };
  }
}

// 导出单例实例
export const aiDataImporter = new AI_data_importer();

export default AI_data_importer;