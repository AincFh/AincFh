/**
 * 分类模型
 * 基于Cloudflare D1数据库
 */

import type { D1Database } from '@cloudflare/workers-types';
import { queryAll, queryFirst, execute } from '../utils/db';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    created_at: number;
    updated_at: number;
}

export interface CategoryWithCount extends Category {
    post_count?: number;
}

export interface CreateCategoryInput {
    name: string;
    slug: string;
    description?: string;
    parent_id?: number;
}

export interface UpdateCategoryInput {
    name?: string;
    slug?: string;
    description?: string;
    parent_id?: number;
}

/**
 * 分类模型类
 */
export class CategoryModel {
    constructor(private db: D1Database) { }

    /**
     * 根据ID查找分类
     */
    async findById(id: number): Promise<Category | null> {
        const sql = 'SELECT * FROM categories WHERE id = ?';
        return await queryFirst<Category>(this.db, sql, [id]);
    }

    /**
     * 根据slug查找分类
     */
    async findBySlug(slug: string): Promise<Category | null> {
        const sql = 'SELECT * FROM categories WHERE slug = ?';
        return await queryFirst<Category>(this.db, sql, [slug]);
    }

    /**
     * 获取所有分类
     */
    async findAll(): Promise<CategoryWithCount[]> {
        const sql = `
      SELECT
        c.*,
        COUNT(p.id) as post_count
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
        return await queryAll<CategoryWithCount>(this.db, sql);
    }

    /**
     * 获取顶级分类(无父分类)
     */
    async findTopLevel(): Promise<CategoryWithCount[]> {
        const sql = `
      SELECT
        c.*,
        COUNT(p.id) as post_count
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      WHERE c.parent_id IS NULL
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
        return await queryAll<CategoryWithCount>(this.db, sql);
    }

    /**
     * 获取子分类
     */
    async findChildren(parentId: number): Promise<CategoryWithCount[]> {
        const sql = `
      SELECT
        c.*,
        COUNT(p.id) as post_count
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      WHERE c.parent_id = ?
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
        return await queryAll<CategoryWithCount>(this.db, sql, [parentId]);
    }

    /**
     * 创建分类
     */
    async create(input: CreateCategoryInput): Promise<Category | null> {
        // 检查slug是否已存在
        const existing = await this.findBySlug(input.slug);
        if (existing) {
            throw new Error('Slug already exists');
        }

        const sql = `
      INSERT INTO categories (name, slug, description, parent_id)
      VALUES (?, ?, ?, ?)
    `;

        const result = await execute(this.db, sql, [
            input.name,
            input.slug,
            input.description || null,
            input.parent_id || null,
        ]);

        if (result.meta.last_row_id) {
            return await this.findById(result.meta.last_row_id);
        }

        return null;
    }

    /**
     * 更新分类
     */
    async update(id: number, input: UpdateCategoryInput): Promise<Category | null> {
        const updates: string[] = [];
        const params: unknown[] = [];

        if (input.name !== undefined) {
            updates.push('name = ?');
            params.push(input.name);
        }

        if (input.slug !== undefined) {
            // 检查新slug是否与其他分类冲突
            const existing = await this.findBySlug(input.slug);
            if (existing && existing.id !== id) {
                throw new Error('Slug already exists');
            }
            updates.push('slug = ?');
            params.push(input.slug);
        }

        if (input.description !== undefined) {
            updates.push('description = ?');
            params.push(input.description);
        }

        if (input.parent_id !== undefined) {
            // 防止循环引用
            if (input.parent_id === id) {
                throw new Error('Category cannot be its own parent');
            }
            updates.push('parent_id = ?');
            params.push(input.parent_id);
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
        await execute(this.db, sql, params);

        return await this.findById(id);
    }

    /**
     * 删除分类
     */
    async delete(id: number): Promise<void> {
        // 检查是否有子分类
        const children = await this.findChildren(id);
        if (children.length > 0) {
            throw new Error('Cannot delete category with children');
        }

        const sql = 'DELETE FROM categories WHERE id = ?';
        await execute(this.db, sql, [id]);
    }

    /**
     * 获取分类的文章数量
     */
    async getPostCount(id: number): Promise<number> {
        const sql = "SELECT COUNT(*) as count FROM posts WHERE category_id = ? AND status = 'published'";
        const result = await queryFirst<{ count: number }>(this.db, sql, [id]);
        return result?.count || 0;
    }
}
