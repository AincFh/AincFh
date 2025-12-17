import { Post } from '../types';

// 数据库名称和版本
const DB_NAME = 'AI_ASSISTANT_DB';
const DB_VERSION = 1;

// 存储对象名称
const STORES = {
  ARTICLES: 'articles',
  VOCABULARY: 'vocabulary',
  QUERIES: 'queries',
  INDEXED_KEYWORDS: 'indexedKeywords'
};

// 文章存储结构
interface ArticleDB extends Post {
  indexedAt: number;
  keywords: string[];
}

// 词汇存储结构
interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  relatedArticles: string[];
  createdAt: number;
  updatedAt: number;
}

// 查询历史结构
interface QueryHistory {
  id: string;
  query: string;
  keywords: string[];
  results: string[]; // 文章ID列表
  timestamp: number;
}

// 关键词索引结构
interface KeywordIndex {
  keyword: string;
  articleIds: string[];
  frequency: number;
  lastUsed: number;
}

class AIDatabase {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  // 初始化数据库
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      // 创建或升级数据库
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建文章存储
        if (!db.objectStoreNames.contains(STORES.ARTICLES)) {
          const articleStore = db.createObjectStore(STORES.ARTICLES, { keyPath: 'id' });
          articleStore.createIndex('by_date', 'date', { unique: false });
          articleStore.createIndex('by_category', 'category', { unique: false });
          articleStore.createIndex('by_tags', 'tags', { unique: false, multiEntry: true });
          articleStore.createIndex('by_keywords', 'keywords', { unique: false, multiEntry: true });
        }

        // 创建词汇存储
        if (!db.objectStoreNames.contains(STORES.VOCABULARY)) {
          const vocabStore = db.createObjectStore(STORES.VOCABULARY, { keyPath: 'id' });
          vocabStore.createIndex('by_word', 'word', { unique: true });
          vocabStore.createIndex('by_relatedArticles', 'relatedArticles', { unique: false, multiEntry: true });
        }

        // 创建查询历史存储
        if (!db.objectStoreNames.contains(STORES.QUERIES)) {
          const queryStore = db.createObjectStore(STORES.QUERIES, { keyPath: 'id' });
          queryStore.createIndex('by_timestamp', 'timestamp', { unique: false });
          queryStore.createIndex('by_keywords', 'keywords', { unique: false, multiEntry: true });
        }

        // 创建关键词索引存储
        if (!db.objectStoreNames.contains(STORES.INDEXED_KEYWORDS)) {
          const keywordStore = db.createObjectStore(STORES.INDEXED_KEYWORDS, { keyPath: 'keyword' });
          keywordStore.createIndex('by_frequency', 'frequency', { unique: false });
          keywordStore.createIndex('by_lastUsed', 'lastUsed', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        resolve();
      };

      request.onerror = (event) => {
        reject(new Error(`数据库初始化失败: ${(event.target as IDBOpenDBRequest).error?.message}`));
      };
    });

    return this.initializationPromise;
  }

  // 获取数据库实例
  private async getDB(): Promise<IDBDatabase> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.db) {
      throw new Error('数据库未初始化');
    }

    return this.db;
  }

  // 通用事务辅助函数
  private async transaction<T>(
    storeName: string,
    mode: 'readonly' | 'readwrite',
    callback: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      const request = callback(store);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`操作失败: ${request.error?.message}`));
      };

      transaction.oncomplete = () => {
        // 事务完成
      };

      transaction.onerror = () => {
        reject(new Error(`事务失败: ${transaction.error?.message}`));
      };
    });
  }

  // 批量事务辅助函数
  private async bulkTransaction<T>(
    storeNames: string[],
    mode: 'readonly' | 'readwrite',
    callback: (transaction: IDBTransaction) => Promise<T>
  ): Promise<T> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, mode);

      callback(transaction)
        .then(resolve)
        .catch(reject);

      transaction.onerror = () => {
        reject(new Error(`批量事务失败: ${transaction.error?.message}`));
      };
    });
  }

  // 添加或更新文章
  async addOrUpdateArticle(article: Post): Promise<void> {
    // 提取关键词（这里使用简单的实现，实际应该使用更复杂的NLP方法）
    const keywords = this.extractKeywords(article.title + ' ' + article.content);

    const articleWithMeta: ArticleDB = {
      ...article,
      indexedAt: Date.now(),
      keywords
    };

    await this.transaction(STORES.ARTICLES, 'readwrite', (store) =>
      store.put(articleWithMeta)
    );

    // 更新关键词索引
    await this.updateKeywordIndex(keywords, article.id, 1);
  }

  // 批量添加或更新文章
  async bulkAddOrUpdateArticles(articles: Post[]): Promise<void> {
    await this.bulkTransaction([STORES.ARTICLES, STORES.INDEXED_KEYWORDS], 'readwrite', async (transaction) => {
      const articleStore = transaction.objectStore(STORES.ARTICLES);

      for (const article of articles) {
        const keywords = this.extractKeywords(article.title + ' ' + article.content);

        const articleWithMeta: ArticleDB = {
          ...article,
          indexedAt: Date.now(),
          keywords
        };

        await new Promise<void>((resolve, reject) => {
          const request = articleStore.put(articleWithMeta);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        // 更新关键词索引
        await this.updateKeywordIndexInTransaction(transaction, keywords, article.id, 1);
      }
    });
  }

  // 通过ID获取文章
  async getArticleById(id: string): Promise<ArticleDB | null> {
    try {
      return await this.transaction(STORES.ARTICLES, 'readonly', (store) =>
        store.get(id)
      );
    } catch {
      return null;
    }
  }

  // 获取所有文章
  async getAllArticles(): Promise<ArticleDB[]> {
    return await this.transaction(STORES.ARTICLES, 'readonly', (store) =>
      store.getAll()
    );
  }

  // 根据关键词搜索文章
  async searchArticlesByKeywords(keywords: string[], limit: number = 10): Promise<ArticleDB[]> {
    if (!keywords.length) return [];

    // 记录查询历史
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.addQueryHistory({
      id: queryId,
      query: keywords.join(' '),
      keywords,
      results: [], // 将在搜索后更新
      timestamp: Date.now()
    });

    // 在事务中执行搜索
    return await this.bulkTransaction([STORES.ARTICLES, STORES.INDEXED_KEYWORDS], 'readwrite', async (transaction) => {
      // 首先获取关键词对应的文章ID
      const articleScores = new Map<string, number>();

      const keywordStore = transaction.objectStore(STORES.INDEXED_KEYWORDS);

      for (const keyword of keywords) {
        const normalizedKeyword = this.normalizeKeyword(keyword);

        const keywordIndex = await new Promise<KeywordIndex | null>((resolve, reject) => {
          const request = keywordStore.get(normalizedKeyword);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        if (keywordIndex) {
          // 更新关键词最后使用时间
          keywordIndex.lastUsed = Date.now();
          keywordStore.put(keywordIndex);

          // 累加文章得分
          for (const articleId of keywordIndex.articleIds) {
            articleScores.set(articleId, (articleScores.get(articleId) || 0) + 1);
          }
        }
      }

      // 按得分排序
      const sortedArticleIds = Array.from(articleScores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])
        .slice(0, limit);

      // 获取文章详情
      const articleStore = transaction.objectStore(STORES.ARTICLES);
      const articles: ArticleDB[] = [];

      for (const id of sortedArticleIds) {
        const article = await new Promise<ArticleDB | undefined>((resolve, reject) => {
          const request = articleStore.get(id);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        if (article) {
          articles.push(article);
        }
      }

      // 更新查询历史的结果
      const queryStore = transaction.objectStore(STORES.QUERIES);
      const query = await new Promise<QueryHistory>((resolve, reject) => {
        const request = queryStore.get(queryId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      query.results = sortedArticleIds;
      queryStore.put(query);

      return articles;
    });
  }

  // 添加查询历史
  async addQueryHistory(query: QueryHistory): Promise<void> {
    await this.transaction(STORES.QUERIES, 'readwrite', (store) =>
      store.put(query)
    );
  }

  // 获取最近的查询历史
  async getRecentQueries(limit: number = 20): Promise<QueryHistory[]> {
    return await this.transaction(STORES.QUERIES, 'readonly', (store) => {
      const index = store.index('by_timestamp');
      return index.getAll(undefined, limit);
    });
  }

  // 添加或更新词汇
  async addOrUpdateVocabulary(word: string, definition: string, relatedArticles: string[] = []): Promise<void> {
    const vocabItem: VocabularyItem = {
      id: `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      word: this.normalizeKeyword(word),
      definition,
      relatedArticles,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.bulkTransaction([STORES.VOCABULARY], 'readwrite', async (transaction) => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(STORES.VOCABULARY);
        // 检查是否已存在该词汇
        const index = store.index('by_word');
        const request = index.get(vocabItem.word);

        request.onsuccess = (event) => {
          const existing = (event.target as IDBRequest<VocabularyItem>).result;
          let putRequest;
          if (existing) {
            // 更新现有词汇
            existing.definition = definition;
            existing.relatedArticles = Array.from(new Set([...existing.relatedArticles, ...relatedArticles]));
            existing.updatedAt = Date.now();
            putRequest = store.put(existing);
          } else {
            // 添加新词汇
            putRequest = store.add(vocabItem);
          }

          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error(`保存词汇失败: ${putRequest.error?.message}`));
        };

        request.onerror = () => reject(new Error(`查询词汇失败: ${request.error?.message}`));
      });
    });
  }

  // 查找词汇
  async findVocabulary(word: string): Promise<VocabularyItem | null> {
    try {
      return await this.transaction(STORES.VOCABULARY, 'readonly', (store) => {
        const index = store.index('by_word');
        return index.get(this.normalizeKeyword(word));
      });
    } catch {
      return null;
    }
  }

  // 工具方法：提取关键词
  private extractKeywords(text: string): string[] {
    // 简单实现：分词并过滤常见词
    const stopWords = new Set(['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', 'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'for', 'on', 'with']);

    // 简单分词（实际项目中应使用更专业的分词库）
    const words = text
      .toLowerCase()
      .replace(/[.,?!;:"\'\(\)\[\]{}]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.has(word));

    // 去重并返回
    return Array.from(new Set(words));
  }

  // 工具方法：标准化关键词
  private normalizeKeyword(keyword: string): string {
    return keyword.toLowerCase().trim();
  }

  // 更新关键词索引
  private async updateKeywordIndex(keywords: string[], articleId: string, increment: number): Promise<void> {
    await this.bulkTransaction([STORES.INDEXED_KEYWORDS], 'readwrite', async (transaction) => {
      await this.updateKeywordIndexInTransaction(transaction, keywords, articleId, increment);
    });
  }

  // 在事务中更新关键词索引
  private async updateKeywordIndexInTransaction(
    transaction: IDBTransaction,
    keywords: string[],
    articleId: string,
    increment: number
  ): Promise<void> {
    const keywordStore = transaction.objectStore(STORES.INDEXED_KEYWORDS);

    for (const rawKeyword of keywords) {
      const keyword = this.normalizeKeyword(rawKeyword);

      const existingIndex = await new Promise<KeywordIndex | null>((resolve, reject) => {
        const request = keywordStore.get(keyword);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (existingIndex) {
        // 更新现有索引
        if (!existingIndex.articleIds.includes(articleId)) {
          existingIndex.articleIds.push(articleId);
        }
        existingIndex.frequency += increment;
        existingIndex.lastUsed = Date.now();
        keywordStore.put(existingIndex);
      } else if (increment > 0) {
        // 创建新索引
        const newIndex: KeywordIndex = {
          keyword,
          articleIds: [articleId],
          frequency: increment,
          lastUsed: Date.now()
        };
        keywordStore.add(newIndex);
      }
    }
  }

  // 清除所有数据（用于重置）
  async clearAll(): Promise<void> {
    await this.bulkTransaction(Object.values(STORES), 'readwrite', async (transaction) => {
      for (const storeName of Object.values(STORES)) {
        const store = transaction.objectStore(storeName);
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    });
  }

  // 获取数据库统计信息
  async getStats(): Promise<{
    articleCount: number;
    vocabularyCount: number;
    queryCount: number;
    keywordCount: number;
  }> {
    const articleCount = await this.transaction(STORES.ARTICLES, 'readonly', (store) => store.count());
    const vocabularyCount = await this.transaction(STORES.VOCABULARY, 'readonly', (store) => store.count());
    const queryCount = await this.transaction(STORES.QUERIES, 'readonly', (store) => store.count());
    const keywordCount = await this.transaction(STORES.INDEXED_KEYWORDS, 'readonly', (store) => store.count());

    return {
      articleCount,
      vocabularyCount,
      queryCount,
      keywordCount
    };
  }
}

// 导出单例实例
export const aiDatabase = new AIDatabase();

export default AIDatabase;