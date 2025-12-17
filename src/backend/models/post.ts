/**
 * 文章模型
 * 基于Cloudflare D1数据库
 */

import type { D1Database } from '@cloudflare/workers-types';
import { queryAll, queryFirst, execute, queryPaginated, type PaginationParams, type PaginatedResult } from '../utils/db';

export interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    cover_image_url: string | null;
    author_id: number | null;
    category_id: number | null;
    status: 'draft' | 'published' | 'archived';
    view_count: number;
    featured: number;
    created_at: number;
    updated_at: number;
    published_at: number | null;
}

export interface PostWithRelations extends Post {
    author_name?: string;
    category_name?: string;
    tags?: Array<{ id: number; name: string; slug: string }>;
}

export interface CreatePostInput {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    cover_image_url?: string;
    author_id: number;
    category_id?: number;
    status?: 'draft' | 'published' | 'archived';
    featured?: boolean;
    tag_ids?: number[];
}

export interface UpdatePostInput {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    cover_image_url?: string;
    category_id?: number;
    status?: 'draft' | 'published' | 'archived';
    featured?: boolean;
    tag_ids?: number[];
}

export interface PostQuery {
    status?: 'draft' | 'published' | 'archived';
    category_id?: number;
    author_id?: number;
    featured?: boolean;
    search?: string;
}

/**
 * 文章模型类
 */
export class PostModel {
    constructor(private db: D1Database) { }

    /**
     * 根据ID查找文章
     */
    async findById(id: number): Promise<Post | null> {
        const sql = 'SELECT * FROM posts WHERE id = ?';
        return await queryFirst<Post>(this.db, sql, [id]);
    }

    /**
     * 根据slug查找文章
     */
    async findBySlug(slug: string): Promise<Post | null> {
        const sql = 'SELECT * FROM posts WHERE slug = ?';
        return await queryFirst<Post>(this.db, sql, [slug]);
    }

    /**
     * 查询文章列表(带分页)
     */
    async findAll(
        query: PostQuery = {},
        pagination: PaginationParams = {}
    ): Promise<PaginatedResult<PostWithRelations>> {
        const conditions: string[] = [];
        const params: unknown[] = [];

        if (query.status) {
            conditions.push('p.status = ?');
            params.push(query.status);
        }

        if (query.category_id) {
            conditions.push('p.category_id = ?');
            params.push(query.category_id);
        }

        if (query.author_id) {
            conditions.push('p.author_id = ?');
            params.push(query.author_id);
        }

        if (query.featured !== undefined) {
            conditions.push('p.featured = ?');
            params.push(query.featured ? 1 : 0);
        }

        if (query.search) {
            conditions.push('(p.title LIKE ? OR p.content LIKE ?)');
            const searchPattern = `%${query.search}%`;
            params.push(searchPattern, searchPattern);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
      SELECT
        p.*,
        u.name as author_name,
        c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `;

        const countSql = `
      SELECT COUNT(*) as total
      FROM posts p
      ${whereClause}
    `;

        return await queryPaginated<PostWithRelations>(this.db, sql, countSql, params, pagination);
    }

    /**
     * 创建文章
     */
    async create(input: CreatePostInput): Promise<Post | null> {
        // 检查slug是否已存在
        const existing = await this.findBySlug(input.slug);
        if (existing) {
            throw new Error('Slug already exists');
        }

        const sql = `
      INSERT INTO posts (
        title, slug, content, excerpt, cover_image_url,
        author_id, category_id, status, featured, published_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const publishedAt = input.status === 'published' ? Date.now() : null;

        const result = await execute(this.db, sql, [
            input.title,
            input.slug,
            input.content,
            input.excerpt || null,
            input.cover_image_url || null,
            input.author_id,
            input.category_id || null,
            input.status || 'draft',
            input.featured ? 1 : 0,
            publishedAt,
        ]);

        if (result.meta.last_row_id) {
            // 处理标签关联
            if (input.tag_ids && input.tag_ids.length > 0) {
                await this.syncTags(result.meta.last_row_id, input.tag_ids);
            }
            return await this.findById(result.meta.last_row_id);
        }

        return null;
    }

    /**
     * 更新文章
     */
    async update(id: number, input: UpdatePostInput): Promise<Post | null> {
        const updates: string[] = [];
        const params: unknown[] = [];

        if (input.title !== undefined) {
            updates.push('title = ?');
            params.push(input.title);
        }

        if (input.slug !== undefined) {
            // 检查新slug是否与其他文章冲突
            const existing = await this.findBySlug(input.slug);
            if (existing && existing.id !== id) {
                throw new Error('Slug already exists');
            }
            updates.push('slug = ?');
            params.push(input.slug);
        }

        if (input.content !== undefined) {
            updates.push('content = ?');
            params.push(input.content);
        }

        if (input.excerpt !== undefined) {
            updates.push('excerpt = ?');
            params.push(input.excerpt);
        }

        if (input.cover_image_url !== undefined) {
            updates.push('cover_image_url = ?');
            params.push(input.cover_image_url);
        }

        if (input.category_id !== undefined) {
            updates.push('category_id = ?');
            params.push(input.category_id);
        }

        if (input.status !== undefined) {
            updates.push('status = ?');
            params.push(input.status);

            // 如果状态改为发布,设置发布时间
            if (input.status === 'published') {
                const post = await this.findById(id);
                if (post && !post.published_at) {
                    updates.push('published_at = ?');
                    params.push(Date.now());
                }
            }
        }

        if (input.featured !== undefined) {
            updates.push('featured = ?');
            params.push(input.featured ? 1 : 0);
        }

        if (updates.length === 0 && !input.tag_ids) {
            return await this.findById(id);
        }

        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id);

            const sql = `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`;
            await execute(this.db, sql, params);
        }

        // 处理标签关联
        if (input.tag_ids !== undefined) {
            await this.syncTags(id, input.tag_ids);
        }

        return await this.findById(id);
    }

    /**
     * 删除文章
     */
    async delete(id: number): Promise<void> {
        const sql = 'DELETE FROM posts WHERE id = ?';
        await execute(this.db, sql, [id]);
    }

    /**
     * 增加浏览量
     */
    async incrementViewCount(id: number): Promise<void> {
        const sql = 'UPDATE posts SET view_count = view_count + 1 WHERE id = ?';
        await execute(this.db, sql, [id]);
    }

    /**
     * 同步文章标签
     */
    private async syncTags(postId: number, tagIds: number[]): Promise<void> {
        // 删除现有标签关联
        await execute(this.db, 'DELETE FROM post_tags WHERE post_id = ?', [postId]);

        // 添加新的标签关联
        if (tagIds.length > 0) {
            const values = tagIds.map(() => '(?, ?)').join(', ');
            const sql = `INSERT INTO post_tags (post_id, tag_id) VALUES ${values}`;
            const params = tagIds.flatMap(tagId => [postId, tagId]);
            await execute(this.db, sql, params);
        }
    }

    /**
     * 获取文章的标签
     */
    async getTags(postId: number): Promise<Array<{ id: number; name: string; slug: string }>> {
        const sql = `
      SELECT t.id, t.name, t.slug
      FROM tags t
      INNER JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
      ORDER BY t.name
    `;
        return await queryAll(this.db, sql, [postId]);
    }
}
