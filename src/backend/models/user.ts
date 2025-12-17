/**
 * 用户模型
 * 基于Cloudflare D1数据库
 */

import type { D1Database } from '@cloudflare/workers-types';
import { queryAll, queryFirst, execute } from '../utils/db';
import { hashPassword, verifyPassword } from '../utils/hash';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  role: 'admin' | 'user';
  avatar_url: string | null;
  bio: string | null;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserInput {
  name?: string;
  avatar_url?: string;
  bio?: string;
}

/**
 * 用户模型类
 */
export class UserModel {
  constructor(private db: D1Database) { }

  /**
   * 根据ID查找用户
   */
  async findById(id: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return await queryFirst<User>(this.db, sql, [id]);
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return await queryFirst<User>(this.db, sql, [email]);
  }

  /**
   * 获取所有用户
   */
  async findAll(): Promise<User[]> {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    return await queryAll<User>(this.db, sql);
  }

  /**
   * 创建新用户
   */
  async create(input: CreateUserInput): Promise<User | null> {
    // 检查邮箱是否已存在
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new Error('Email already exists');
    }

    // 哈希密码
    const passwordHash = await hashPassword(input.password);

    const sql = `
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES (?, ?, ?, ?, 1)
    `;

    const result = await execute(this.db, sql, [
      input.email,
      passwordHash,
      input.name || null,
      input.role || 'user',
    ]);

    if (result.meta.last_row_id) {
      return await this.findById(result.meta.last_row_id);
    }

    return null;
  }

  /**
   * 更新用户信息
   */
  async update(id: number, input: UpdateUserInput): Promise<User | null> {
    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name);
    }

    if (input.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(input.avatar_url);
    }

    if (input.bio !== undefined) {
      updates.push('bio = ?');
      params.push(input.bio);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await execute(this.db, sql, params);

    return await this.findById(id);
  }

  /**
   * 更新密码
   */
  async updatePassword(id: number, newPassword: string): Promise<void> {
    const passwordHash = await hashPassword(newPassword);
    const sql = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await execute(this.db, sql, [passwordHash, id]);
  }

  /**
   * 验证用户密码
   */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  /**
   * 删除用户
   */
  async delete(id: number): Promise<void> {
    const sql = 'DELETE FROM users WHERE id = ?';
    await execute(this.db, sql, [id]);
  }

  /**
   * 切换用户激活状态
   */
  async toggleActive(id: number): Promise<User | null> {
    const sql = 'UPDATE users SET is_active = 1 - is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await execute(this.db, sql, [id]);
    return await this.findById(id);
  }
}