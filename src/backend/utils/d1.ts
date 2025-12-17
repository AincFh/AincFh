// D1数据库适配器 - 用于Cloudflare Pages Functions

// 定义D1数据库客户端接口
// 定义D1预处理语句接口
export interface D1PreparedStatement {
  bind(...args: any[]): D1PreparedStatement;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<{ changes: number; lastInsertRowid?: number }>;
  get<T>(): Promise<{ results: T }>;
}

// 定义D1数据库客户端接口
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<any>;
  batch<T>(statements: any[]): Promise<T[]>;
}

// 数据库适配器类，封装D1操作
export class D1Adapter {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 执行参数化查询
   * @param query SQL查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  async query<T>(query: string, params: any[] = []): Promise<T[]> {
    const statement = this.db.prepare(query);

    if (params.length > 0) {
      params.forEach((param, index) => {
        statement.bind(param);
      });
    }

    const result = await statement.all<T>();
    return result.results || [];
  }

  /**
   * 执行单个插入/更新/删除操作
   * @param query SQL查询语句
   * @param params 查询参数
   * @returns 影响的行数
   */
  async run(query: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid?: number }> {
    const statement = this.db.prepare(query);

    if (params.length > 0) {
      params.forEach((param, index) => {
        statement.bind(param);
      });
    }

    return await statement.run();
  }

  /**
   * 执行批量操作
   * @param queries SQL查询语句数组
   * @returns 所有操作的结果
   */
  async batch<T>(queries: { sql: string; params?: any[] }[]): Promise<T[]> {
    const statements = queries.map(q => {
      const stmt = this.db.prepare(q.sql);
      if (q.params && q.params.length > 0) {
        q.params.forEach(param => stmt.bind(param));
      }
      return stmt;
    });

    return await this.db.batch(statements);
  }

  /**
   * 获取单行数据
   * @param query SQL查询语句
   * @param params 查询参数
   * @returns 单行数据或null
   */
  async get<T>(query: string, params: any[] = []): Promise<T | null> {
    const statement = this.db.prepare(query);

    if (params.length > 0) {
      params.forEach((param, index) => {
        statement.bind(param);
      });
    }

    const result = await statement.get<T>();
    return result.results || null;
  }

  /**
   * 执行原始SQL语句
   * @param query SQL查询语句
   * @returns 执行结果
   */
  async exec(query: string): Promise<any> {
    return await this.db.exec(query);
  }
}

// 导出数据库助手函数
export function getD1Adapter(db: D1Database): D1Adapter {
  return new D1Adapter(db);
}

// 事务处理助手
export async function withTransaction<T>(
  db: D1Database,
  callback: (adapter: D1Adapter) => Promise<T>
): Promise<T> {
  const adapter = new D1Adapter(db);

  try {
    await adapter.exec('BEGIN TRANSACTION');
    const result = await callback(adapter);
    await adapter.exec('COMMIT');
    return result;
  } catch (error) {
    await adapter.exec('ROLLBACK');
    throw error;
  }
}