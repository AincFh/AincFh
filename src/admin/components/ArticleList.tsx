"use client";

import { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from './ui/DataTable';
import { Button } from '@/shared/components/ui/Button';
import { Post } from '@/shared/types/post';

interface ArticleListProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
}

export default function ArticleList({ onSearch, onFilter }: ArticleListProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [limit] = useState(10);

  // 获取文章列表
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        // 构建查询参数
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', limit.toString());
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter) params.append('status', statusFilter);
        if (categoryFilter) params.append('category', categoryFilter);

        const response = await fetch(`/api/admin/posts?${params.toString()}`);
        const data = await response.json();
        if (data.ok) {
          setArticles(data.data);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, limit, searchQuery, statusFilter, categoryFilter]);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    onSearch?.(query);
  };

  // 处理筛选
  const handleFilter = () => {
    onFilter?.();
  };

  // 处理文章操作
  const handleArticleAction = (article: Post, action: 'view' | 'edit' | 'delete') => {
    switch (action) {
      case 'view':
        router.push(`/posts/${article.id}`);
        break;
      case 'edit':
        router.push(`/admin/posts/${article.id}/edit`);
        break;
      case 'delete':
        if (confirm(`确定要删除文章 "${article.title}" 吗？`)) {
          handleDeleteArticle(article.id);
        }
        break;
      default:
        break;
    }
  };

  // 删除文章
  const handleDeleteArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.ok) {
        setArticles(articles.filter(article => article.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  // 定义列
  const columns: Column<Post>[] = [
    {
      key: 'title',
      header: '标题',
      render: (article) => (
        <div className="font-medium">
          {article.title}
        </div>
      ),
      sortable: true,
      width: '300px',
    },
    {
      key: 'status',
      header: '状态',
      render: (article) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${article.status === 'published'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}
        >
          {article.status === 'published' ? '已发布' : '草稿'}
        </span>
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'author',
      header: '作者',
      render: (article) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <img
              src={article.author.avatar}
              alt={article.author.username}
              className="w-full h-full object-cover"
            />
          </div>
          <span>{article.author.username}</span>
        </div>
      ),
      sortable: true,
      width: '150px',
    },
    {
      key: 'categories',
      header: '分类',
      render: (article) => (
        <div className="flex flex-wrap gap-1">
          {article.categories.map(category => (
            <span
              key={category.id}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
            >
              {category.name}
            </span>
          ))}
        </div>
      ),
      width: '150px',
    },
    {
      key: 'tags',
      header: '标签',
      render: (article) => (
        <div className="flex flex-wrap gap-1">
          {article.tags.map(tag => (
            <span
              key={tag.id}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
            >
              {tag.name}
            </span>
          ))}
        </div>
      ),
      width: '200px',
    },
    {
      key: 'createdAt',
      header: '创建时间',
      render: (article) => (
        <span className="text-sm">
          {new Date(article.createdAt).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      width: '150px',
    },
    {
      key: 'updatedAt',
      header: '更新时间',
      render: (article) => (
        <span className="text-sm">
          {new Date(article.updatedAt).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      width: '150px',
    },
    {
      key: 'actions',
      header: '操作',
      render: (article) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => handleArticleAction(article, 'view')}
          >
            查看
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => handleArticleAction(article, 'edit')}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleArticleAction(article, 'delete')}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            删除
          </Button>
        </div>
      ),
      width: '200px',
    },
  ];

  // 状态筛选选项
  const statusFilterOptions = [
    { value: '', label: '全部状态' },
    { value: 'published', label: '已发布' },
    { value: 'draft', label: '草稿' },
    { value: 'archived', label: '已归档' }
  ];

  // 处理状态筛选变化
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value || undefined);
    setCurrentPage(1);
  };

  // 筛选器配置
  const filters = [
    {
      label: '状态',
      options: statusFilterOptions,
      value: statusFilter || '',
      onChange: handleStatusFilterChange
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={() => router.push('/admin/posts/new')}
        >
          新建文章
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={articles}
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={filters}
        loading={loading}
        onRowClick={(article) => setSelectedArticle(article)}
      />
    </div>
  );
}
