/**
 * 评论模型
 * 基于Cloudflare D1数据库
 */

import type { D1Database } from '@cloudflare/workers-types';
import { queryAll, queryFirst, execute, queryPaginated, type PaginationParams, type PaginatedResult } from '../utils/db';

export interface Comment {
    id: number;
    post_id: number;
    user_id: number | null;
    parent_id: number | null;
    content: string;
    author_name: string | null;
    author_email: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: number;
    updated_at: number;
}

export interface CommentWithRelations extends Comment {
    post_title?: string;
    user_name?: string;
    replies?: Comment[];
}

export interface CreateCommentInput {
    post_id: number;
    user_id?: number;
    parent_id?: number;
    content: string;
    author_name?: string;
    author_email?: string;
}

export interface UpdateCommentInput {
    content?: string;
    status?: 'pending' | 'approved' | 'rejected';
}

export interface CommentQuery {
    post_id?: number;
    user_id?: number;
    status?: 'pending' | 'approved' | 'rejected';
    parent_id?: number | null;
}

/**
 * 评论模型类
 */
export class CommentModel {
    constructor(private db: D1Database) { }

    /**
     * 根据ID查找评论
     */
    async findById(id: number): Promise<Comment | null> {
        const sql = 'SELECT * FROM comments WHERE id = ?';
        return await queryFirst<Comment>(this.db, sql, [id]);
    }

    /**
     * 查询评论列表(带分页)
     */
    async findAll(
        query: CommentQuery = {},
        pagination: PaginationParams = {}
    ): Promise<PaginatedResult<CommentWithRelations>> {
        const conditions: string[] = [];
        const params: unknown[] = [];

        if (query.post_id) {
            conditions.push('c.post_id = ?');
            params.push(query.post_id);
        }

        if (query.user_id) {
            conditions.push('c.user_id = ?');
            params.push(query.user_id);
        }

        if (query.status) {
            conditions.push('c.status = ?');
            params.push(query.status);
        }

        if (query.parent_id !== undefined) {
            if (query.parent_id === null) {
                conditions.push('c.parent_id IS NULL');
            } else {
                conditions.push('c.parent_id = ?');
                params.push(query.parent_id);
            }
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
      SELECT
        c.*,
        p.title as post_title,
        u.name as user_name
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      LEFT JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
    `;

        const countSql = `
      SELECT COUNT(*) as total
      FROM comments c
      ${whereClause}
    `;

        return await queryPaginated<CommentWithRelations>(this.db, sql, countSql, params, pagination);
    }

    /**
     * 获取文章的所有评论(包括回复)
     */
    async findByPost(postId: number): Promise<CommentWithRelations[]> {
        // 先获取顶级评论
        const topComments = await queryAll<CommentWithRelations>(
            this.db,
            `
        SELECT c.*, u.name as user_name
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ? AND c.parent_id IS NULL AND c.status = 'approved'
        ORDER BY c.created_at DESC
      `,
            [postId]
        );

        // 为每个顶级评论获取回复
        for (const comment of topComments) {
            comment.replies = await this.findReplies(comment.id);
        }

        return topComments;
    }

    /**
     * 获取评论的回复
     */
    async findReplies(parentId: number): Promise<Comment[]> {
        const sql = `
      SELECT c.*, u.name as user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = ? AND c.status = 'approved'
      ORDER BY c.created_at ASC
    `;
        return await queryAll<Comment>(this.db, sql, [parentId]);
    }

    /**
     * 创建评论
     */
    async create(input: CreateCommentInput): Promise<Comment | null> {
        const sql = `
      INSERT INTO comments (
        post_id, user_id, parent_id, content,
        author_name, author_email, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        // 如果是登录用户评论,自动批准;否则待审核
        const status = input.user_id ? 'approved' : 'pending';

        const result = await execute(this.db, sql, [
            input.post_id,
            input.user_id || null,
            input.parent_id || null,
            input.content,
            input.author_name || null,
            input.author_email || null,
            status,
        ]);

        if (result.meta.last_row_id) {
            return await this.findById(result.meta.last_row_id);
        }

        return null;
    }

    /**
     * 更新评论
     */
    async update(id: number, input: UpdateCommentInput): Promise<Comment | null> {
        const updates: string[] = [];
        const params: unknown[] = [];

        if (input.content !== undefined) {
            updates.push('content = ?');
            params.push(input.content);
        }

        if (input.status !== undefined) {
            updates.push('status = ?');
            params.push(input.status);
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        const sql = `UPDATE comments SET ${updates.join(', ')} WHERE id = ?`;
        await execute(this.db, sql, params);

        return await this.findById(id);
    }

    /**
     * 批准评论
     */
    async approve(id: number): Promise<Comment | null> {
        return await this.update(id, { status: 'approved' });
    }

    /**
     * 拒绝评论
     */
    async reject(id: number): Promise<Comment | null> {
        return await this.update(id, { status: 'rejected' });
    }

    /**
     * 删除评论
     */
    async delete(id: number): Promise<void> {
        const sql = 'DELETE FROM comments WHERE id = ?';
        await execute(this.db, sql, [id]);
    }

    /**
     * 获取待审核评论数量
     */
    async getPendingCount(): Promise<number> {
        const sql = "SELECT COUNT(*) as count FROM comments WHERE status = 'pending'";
        const result = await queryFirst<{ count: number }>(this.db, sql);
        return result?.count || 0;
    }

    /**
     * 获取文章的评论数量
     */
    async getPostCommentCount(postId: number): Promise<number> {
        const sql = "SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND status = 'approved'";
        const result = await queryFirst<{ count: number }>(this.db, sql, [postId]);
        return result?.count || 0;
    }
}
