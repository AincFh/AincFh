/**
 * 标签模型
 * 基于Cloudflare D1数据库
 */

import type { D1Database } from '@cloudflare/workers-types';
import { queryAll, queryFirst, execute } from '../utils/db';

export interface Tag {
    id: number;
    name: string;
    slug: string;
    created_at: number;
    updated_at: number;
}

export interface TagWithCount extends Tag {
    post_count?: number;
}

export interface CreateTagInput {
    name: string;
    slug: string;
}

export interface UpdateTagInput {
    name?: string;
    slug?: string;
}

/**
 * 标签模型类
 */
export class TagModel {
    constructor(private db: D1Database) { }

    /**
     * 根据ID查找标签
     */
    async findById(id: number): Promise<Tag | null> {
        const sql = 'SELECT * FROM tags WHERE id = ?';
        return await queryFirst<Tag>(this.db, sql, [id]);
    }

    /**
     * 根据slug查找标签
     */
    async findBySlug(slug: string): Promise<Tag | null> {
        const sql = 'SELECT * FROM tags WHERE slug = ?';
        return await queryFirst<Tag>(this.db, sql, [slug]);
    }

    /**
     * 根据名称查找标签
     */
    async findByName(name: string): Promise<Tag | null> {
        const sql = 'SELECT * FROM tags WHERE name = ?';
        return await queryFirst<Tag>(this.db, sql, [name]);
    }

    /**
     * 获取所有标签
     */
    async findAll(): Promise<TagWithCount[]> {
        const sql = `
      SELECT
        t.*,
        COUNT(pt.post_id) as post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
      GROUP BY t.id
      ORDER BY post_count DESC, t.name ASC
    `;
        return await queryAll<TagWithCount>(this.db, sql);
    }

    /**
     * 搜索标签(用于自动完成)
     */
    async search(query: string, limit: number = 10): Promise<Tag[]> {
        const sql = `
      SELECT * FROM tags
      WHERE name LIKE ?
      ORDER BY name ASC
      LIMIT ?
    `;
        return await queryAll<Tag>(this.db, sql, [`%${query}%`, limit]);
    }

    /**
     * 创建标签
     */
    async create(input: CreateTagInput): Promise<Tag | null> {
        // 检查slug是否已存在
        const existing = await this.findBySlug(input.slug);
        if (existing) {
            throw new Error('Slug already exists');
        }

        const sql = `
      INSERT INTO tags (name, slug)
      VALUES (?, ?)
    `;

        const result = await execute(this.db, sql, [
            input.name,
            input.slug,
        ]);

        if (result.meta.last_row_id) {
            return await this.findById(result.meta.last_row_id);
        }

        return null;
    }

    /**
     * 批量创建标签(如果不存在)
     */
    async findOrCreate(names: string[]): Promise<Tag[]> {
        const tags: Tag[] = [];

        for (const name of names) {
            let tag = await this.findByName(name);

            if (!tag) {
                // 生成slug
                const slug = name.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-\u4e00-\u9fa5]+/g, '');

                tag = await this.create({ name, slug });
            }

            if (tag) {
                tags.push(tag);
            }
        }

        return tags;
    }

    /**
     * 更新标签
     */
    async update(id: number, input: UpdateTagInput): Promise<Tag | null> {
        const updates: string[] = [];
        const params: unknown[] = [];

        if (input.name !== undefined) {
            updates.push('name = ?');
            params.push(input.name);
        }

        if (input.slug !== undefined) {
            // 检查新slug是否与其他标签冲突
            const existing = await this.findBySlug(input.slug);
            if (existing && existing.id !== id) {
                throw new Error('Slug already exists');
            }
            updates.push('slug = ?');
            params.push(input.slug);
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        const sql = `UPDATE tags SET ${updates.join(', ')} WHERE id = ?`;
        await execute(this.db, sql, params);

        return await this.findById(id);
    }

    /**
     * 删除标签
     */
    async delete(id: number): Promise<void> {
        const sql = 'DELETE FROM tags WHERE id = ?';
        await execute(this.db, sql, [id]);
    }

    /**
     * 获取标签的文章数量
     */
    async getPostCount(id: number): Promise<number> {
        const sql = `
      SELECT COUNT(*) as count
      FROM post_tags pt
      INNER JOIN posts p ON pt.post_id = p.id
      WHERE pt.tag_id = ? AND p.status = 'published'
    `;
        const result = await queryFirst<{ count: number }>(this.db, sql, [id]);
        return result?.count || 0;
    }

    /**
     * 获取热门标签
     */
    async getPopular(limit: number = 10): Promise<TagWithCount[]> {
        const sql = `
      SELECT
        t.*,
        COUNT(pt.post_id) as post_count
      FROM tags t
      INNER JOIN post_tags pt ON t.id = pt.tag_id
      INNER JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
      GROUP BY t.id
      ORDER BY post_count DESC
      LIMIT ?
    `;
        return await queryAll<TagWithCount>(this.db, sql, [limit]);
    }
}
