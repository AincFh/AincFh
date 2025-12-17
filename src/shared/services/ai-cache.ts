import { Post } from '../types';

// 缓存键前缀
const CACHE_PREFIX = 'ai_assistant_';

// 缓存类型
type CacheType = 'search' | 'article' | 'vocabulary' | 'keyword' | 'stats';

// 缓存条目接口
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  accessCount: number;
  lastAccess: number;
}

// LRU缓存项
interface LRUCacheItem {
  key: string;
  timestamp: number;
  size: number;
}

/**
 * AI助手缓存管理器
 */
class AICache {
  // 内存缓存
  private memoryCache = new Map<string, CacheEntry<any>>();

  // LRU队列，用于内存缓存淘汰
  private lruQueue: LRUCacheItem[] = [];

  // 配置参数
  private config = {
    // 内存缓存配置
    memoryCacheMaxSize: 50 * 1024 * 1024, // 50MB
    memoryCacheMaxItems: 1000,

    // 持久化缓存配置
    persistentCacheEnabled: true,
    persistentCacheMaxSize: 100 * 1024 * 1024, // 100MB

    // 默认过期时间（毫秒）
    defaultExpiry: {
      search: 3600000, // 1小时
      article: 86400000, // 24小时
      vocabulary: 604800000, // 7天
      keyword: 172800000, // 2天
      stats: 3600000 // 1小时
    },

    // LRU配置
    lruScanInterval: 5000 // 5秒
  };

  // 持久化存储是否可用
  private isPersistentStorageAvailable: boolean;

  // 已使用的缓存大小
  private usedMemorySize = 0;

  constructor() {
    // 检查本地存储是否可用
    this.isPersistentStorageAvailable = this.checkStorageAvailability();

    // 启动LRU扫描器
    this.startLRUScanner();
  }

  /**
   * 检查存储是否可用
   */
  private checkStorageAvailability(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }

      // 测试存储写入
      const testKey = `${CACHE_PREFIX}_test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('本地存储不可用:', e);
      return false;
    }
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(type: CacheType, id: string): string {
    return `${CACHE_PREFIX}${type}_${id}`;
  }

  /**
   * 获取缓存数据大小（估算）
   */
  private getDataSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch (e) {
      return 0;
    }
  }

  /**
   * 添加或更新内存缓存
   */
  private setMemoryCache(key: string, data: any, expiry: number): void {
    // 计算数据大小
    const dataSize = this.getDataSize(data);

    // 检查是否需要清理
    this.ensureCacheSpace(dataSize);

    // 创建缓存条目
    const entry: CacheEntry<any> = {
      data,
      timestamp: Date.now(),
      expiry,
      accessCount: 0,
      lastAccess: Date.now()
    };

    // 更新或添加缓存
    if (this.memoryCache.has(key)) {
      // 减去旧数据大小
      const oldEntry = this.memoryCache.get(key)!;
      this.usedMemorySize -= this.getDataSize(oldEntry.data);

      // 更新LRU记录
      this.updateLRU(key, dataSize);
    } else {
      // 添加新的LRU记录
      this.lruQueue.push({ key, timestamp: Date.now(), size: dataSize });
    }

    // 添加到内存缓存
    this.memoryCache.set(key, entry);
    this.usedMemorySize += dataSize;
  }

  /**
   * 从内存缓存获取数据
   */
  private getMemoryCache(key: string): any | null {
    const entry = this.memoryCache.get(key);

    if (!entry) return null;

    // 检查是否过期
    if (Date.now() > entry.expiry) {
      this.removeMemoryCache(key);
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccess = Date.now();
    this.memoryCache.set(key, entry);

    // 更新LRU顺序
    this.updateLRU(key, this.getDataSize(entry.data));

    return entry.data;
  }

  /**
   * 从内存缓存中移除数据
   */
  private removeMemoryCache(key: string): void {
    const entry = this.memoryCache.get(key);
    if (entry) {
      this.usedMemorySize -= this.getDataSize(entry.data);
      this.memoryCache.delete(key);

      // 从LRU队列中移除
      this.lruQueue = this.lruQueue.filter(item => item.key !== key);
    }
  }

  /**
   * 更新LRU队列
   */
  private updateLRU(key: string, size: number): void {
    const index = this.lruQueue.findIndex(item => item.key === key);
    if (index !== -1) {
      // 移到队列末尾（最近使用）
      const item = this.lruQueue.splice(index, 1)[0];
      item.timestamp = Date.now();
      item.size = size;
      this.lruQueue.push(item);
    }
  }

  /**
   * 确保缓存有足够空间
   */
  private ensureCacheSpace(requiredSize: number): void {
    // 检查项目数量限制
    while (this.memoryCache.size >= this.config.memoryCacheMaxItems ||
           this.usedMemorySize + requiredSize > this.config.memoryCacheMaxSize) {
      // 删除最久未使用的项目（队列头部）
      if (this.lruQueue.length > 0) {
        const oldestItem = this.lruQueue.shift()!;
        this.removeMemoryCache(oldestItem.key);
      } else {
        break;
      }
    }
  }

  /**
   * 从持久化存储获取缓存
   */
  private getPersistentCache(key: string): any | null {
    if (!this.isPersistentStorageAvailable) return null;

    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr) as CacheEntry<any>;

      // 检查是否过期
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      // 更新访问计数
      item.accessCount++;
      item.lastAccess = Date.now();
      localStorage.setItem(key, JSON.stringify(item));

      return item.data;
    } catch (e) {
      console.error('获取持久化缓存失败:', e);
      return null;
    }
  }

  /**
   * 设置持久化存储缓存
   */
  private setPersistentCache(key: string, data: any, expiry: number): void {
    if (!this.isPersistentStorageAvailable) return;

    try {
      const item: CacheEntry<any> = {
        data,
        timestamp: Date.now(),
        expiry,
        accessCount: 1,
        lastAccess: Date.now()
      };

      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.error('设置持久化缓存失败:', e);
      // 如果是存储空间不足，尝试清理一些旧缓存
      if ((e as Error).name === 'QuotaExceededError') {
        this.clearOldPersistentCache();
      }
    }
  }

  /**
   * 清理旧的持久化缓存
   */
  private clearOldPersistentCache(): void {
    if (!this.isPersistentStorageAvailable) return;

    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      // 收集所有过期的缓存键
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          try {
            const itemStr = localStorage.getItem(key);
            if (itemStr) {
              const item = JSON.parse(itemStr) as CacheEntry<any>;
              if (now > item.expiry) {
                keysToRemove.push(key);
              }
            }
          } catch {
            // 如果解析失败，也删除
            keysToRemove.push(key);
          }
        }
      }

      // 删除过期的缓存
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }

      // 如果还是空间不足，删除最旧的缓存
      if (keysToRemove.length === 0) {
        const oldestKeys: Array<{ key: string; timestamp: number }> = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CACHE_PREFIX)) {
            try {
              const itemStr = localStorage.getItem(key);
              if (itemStr) {
                const item = JSON.parse(itemStr) as CacheEntry<any>;
                oldestKeys.push({ key, timestamp: item.timestamp });
              }
            } catch {}
          }
        }

        // 按时间排序并删除最旧的10%缓存
        oldestKeys
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, Math.max(1, Math.floor(oldestKeys.length * 0.1)))
          .forEach(item => localStorage.removeItem(item.key));
      }
    } catch (e) {
      console.error('清理持久化缓存失败:', e);
    }
  }

  /**
   * 启动LRU扫描器
   */
  private startLRUScanner(): void {
    setInterval(() => {
      this.cleanExpiredCache();
    }, this.config.lruScanInterval);
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // 检查并清理过期的内存缓存
    this.memoryCache.forEach((entry, key) => {
      if (now > entry.expiry) {
        expiredKeys.push(key);
      }
    });

    // 删除过期的缓存
    for (const key of expiredKeys) {
      this.removeMemoryCache(key);
    }

    // 限制LRU队列大小
    if (this.lruQueue.length > this.config.memoryCacheMaxItems) {
      const excessCount = this.lruQueue.length - this.config.memoryCacheMaxItems;
      for (let i = 0; i < excessCount; i++) {
        const oldestItem = this.lruQueue.shift();
        if (oldestItem) {
          this.removeMemoryCache(oldestItem.key);
        }
      }
    }
  }

  /**
   * 获取缓存数据
   */
  async get<T>(type: CacheType, id: string): Promise<T | null> {
    const key = this.getCacheKey(type, id);

    // 1. 先尝试从内存缓存获取
    let data = this.getMemoryCache(key);
    if (data !== null) {
      return data as T;
    }

    // 2. 如果内存缓存没有，尝试从持久化存储获取
    data = this.getPersistentCache(key);
    if (data !== null) {
      // 将数据加载到内存缓存中
      const expiry = this.config.defaultExpiry[type];
      this.setMemoryCache(key, data, Date.now() + expiry);
      return data as T;
    }

    return null;
  }

  /**
   * 设置缓存数据
   */
  async set<T>(type: CacheType, id: string, data: T, customExpiry?: number): Promise<void> {
    const key = this.getCacheKey(type, id);
    const expiry = customExpiry || this.config.defaultExpiry[type];
    const expiryTime = Date.now() + expiry;

    // 设置内存缓存
    this.setMemoryCache(key, data, expiryTime);

    // 设置持久化缓存
    this.setPersistentCache(key, data, expiryTime);
  }

  /**
   * 删除缓存
   */
  async remove(type: CacheType, id: string): Promise<void> {
    const key = this.getCacheKey(type, id);

    // 从内存缓存移除
    this.removeMemoryCache(key);

    // 从持久化存储移除
    if (this.isPersistentStorageAvailable) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('删除持久化缓存失败:', e);
      }
    }
  }

  /**
   * 清除指定类型的所有缓存
   */
  async clearByType(type: CacheType): Promise<void> {
    const typePrefix = `${CACHE_PREFIX}${type}_`;

    // 清除内存缓存
    const keysToRemove: string[] = [];
    this.memoryCache.forEach((_, key) => {
      if (key.startsWith(typePrefix)) {
        keysToRemove.push(key);
      }
    });

    for (const key of keysToRemove) {
      this.removeMemoryCache(key);
    }

    // 清除持久化缓存
    if (this.isPersistentStorageAvailable) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(typePrefix)) {
            keysToRemove.push(key);
          }
        }

        for (const key of keysToRemove) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error('清除持久化缓存失败:', e);
      }
    }
  }

  /**
   * 清除所有缓存
   */
  async clearAll(): Promise<void> {
    // 清除内存缓存
    this.memoryCache.clear();
    this.lruQueue = [];
    this.usedMemorySize = 0;

    // 清除持久化缓存
    if (this.isPersistentStorageAvailable) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CACHE_PREFIX)) {
            keysToRemove.push(key);
          }
        }

        for (const key of keysToRemove) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error('清除所有持久化缓存失败:', e);
      }
    }
  }

  /**
   * 获取搜索结果缓存
   */
  async getSearchCache(query: string): Promise<any[] | null> {
    // 为搜索查询创建标准化的缓存键
    const normalizedQuery = query.toLowerCase().trim();
    return this.get<any[]>('search', normalizedQuery);
  }

  /**
   * 设置搜索结果缓存
   */
  async setSearchCache(query: string, results: any[], expiry?: number): Promise<void> {
    const normalizedQuery = query.toLowerCase().trim();
    await this.set('search', normalizedQuery, results, expiry);
  }

  /**
   * 获取文章缓存
   */
  async getArticleCache(articleId: string): Promise<Post | null> {
    return this.get<Post>('article', articleId);
  }

  /**
   * 设置文章缓存
   */
  async setArticleCache(articleId: string, article: Post, expiry?: number): Promise<void> {
    await this.set('article', articleId, article, expiry);
  }

  /**
   * 清除搜索缓存
   */
  async clearSearchCache(): Promise<void> {
    await this.clearByType('search');
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    memoryCacheSize: number;
    memoryCacheItems: number;
    persistentStorageAvailable: boolean;
    usedMemorySize: number;
    memoryCacheMaxSize: number;
  } {
    return {
      memoryCacheSize: this.memoryCache.size,
      memoryCacheItems: this.lruQueue.length,
      persistentStorageAvailable: this.isPersistentStorageAvailable,
      usedMemorySize: this.usedMemorySize,
      memoryCacheMaxSize: this.config.memoryCacheMaxSize
    };
  }

  /**
   * 设置缓存配置
   */
  setConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// 导出单例实例
export const aiCache = new AICache();

export default AICache;