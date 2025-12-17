// 文章相关类型定义
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  tags: Tag[];
  categories: Category[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
}