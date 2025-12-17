/**
 * Cloudflare D1数据库工具类
 * 提供数据库连接和通用查询方法
 */

import type { D1Database, D1Result } from '@cloudflare/workers-types';

export interface DatabaseEnv {
    DB: D1Database;
}

/**
 * 获取D1数据库实例
 * 在API路由中从环境变量获取
 */
export function getDatabase(env: DatabaseEnv): D1Database {
    if (!env.DB) {
        throw new Error('Database not available. Make sure D1 binding is configured in wrangler.toml');
    }
    return env.DB;
}

/**
 * 执行查询并返回所有结果
 */
export async function queryAll<T = unknown>(
    db: D1Database,
    sql: string,
    params: unknown[] = []
): Promise<T[]> {
    try {
        const result = await db.prepare(sql).bind(...params).all<T>();
        return result.results || [];
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * 执行查询并返回第一条结果
 */
export async function queryFirst<T = unknown>(
    db: D1Database,
    sql: string,
    params: unknown[] = []
): Promise<T | null> {
    try {
        const result = await db.prepare(sql).bind(...params).first<T>();
        return result || null;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * 执行插入/更新/删除操作
 */
export async function execute(
    db: D1Database,
    sql: string,
    params: unknown[] = []
): Promise<D1Result> {
    try {
        const result = await db.prepare(sql).bind(...params).run();
        return result;
    } catch (error) {
        console.error('Database execute error:', error);
        throw new Error(`Database execute failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * 执行批量操作(事务)
 */
export async function executeBatch(
    db: D1Database,
    statements: Array<{ sql: string; params?: unknown[] }>
): Promise<D1Result[]> {
    try {
        const prepared = statements.map(({ sql, params = [] }) =>
            db.prepare(sql).bind(...params)
        );
        const results = await db.batch(prepared);
        return results;
    } catch (error) {
        console.error('Database batch error:', error);
        throw new Error(`Database batch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * 分页查询辅助函数
 */
export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function queryPaginated<T = unknown>(
    db: D1Database,
    sql: string,
    countSql: string,
    params: unknown[] = [],
    pagination: PaginationParams = {}
): Promise<PaginatedResult<T>> {
    const page = Math.max(1, pagination.page || 1);
    const pageSize = Math.min(100, Math.max(1, pagination.pageSize || 10));
    const offset = (page - 1) * pageSize;

    // 获取总数
    const countResult = await queryFirst<{ total: number }>(db, countSql, params);
    const total = countResult?.total || 0;

    // 获取分页数据
    const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
    const data = await queryAll<T>(db, paginatedSql, [...params, pageSize, offset]);

    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
