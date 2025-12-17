// 评论服务 - 统一管理评论相关数据获取逻辑
import { apiClient } from '../utils/api-client';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  likes: number;
  isLiked: boolean;
}

export interface CommentCreateData {
  postId: string;
  content: string;
  parentId?: string; // 如果是回复评论，则包含父评论ID
}

export interface CommentUpdateData {
  content: string;
}

// 评论服务
export class CommentService {
  // 获取文章评论列表
  static async getCommentsByPostId(postId: string, params: {
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'oldest' | 'popular';
  } = {}): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
  }> {
    // 在实际应用中，这里应该调用API
    // return apiClient.getPaginated(`/posts/${postId}/comments`, params);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    const { page = 1, limit = 10, sortBy = 'newest' } = params;

    // 模拟评论数据
    const mockComments: Comment[] = [
      {
        id: "1",
        postId,
        userId: "2",
        username: "张三",
        userAvatar: "https://picsum.photos/seed/user2/100/100.jpg",
        content: "这篇文章写得真好！对Next.js 14的新特性有了更深入的了解。",
        createdAt: "2024-01-16T08:30:00Z",
        updatedAt: "2024-01-16T08:30:00Z",
        likes: 5,
        isLiked: false,
        replies: [
          {
            id: "1-1",
            postId,
            userId: "1",
            username: "文章作者",
            userAvatar: "https://picsum.photos/seed/author1/100/100.jpg",
            content: "谢谢你的支持！很高兴这篇文章对你有帮助。",
            createdAt: "2024-01-16T09:15:00Z",
            updatedAt: "2024-01-16T09:15:00Z",
            likes: 2,
            isLiked: true
          }
        ]
      },
      {
        id: "2",
        postId,
        userId: "3",
        username: "李四",
        userAvatar: "https://picsum.photos/seed/user3/100/100.jpg",
        content: "Turbopack的性能提升真的很明显，我在项目中已经体验到了。不过服务器组件的概念还需要一些时间来适应。",
        createdAt: "2024-01-16T10:45:00Z",
        updatedAt: "2024-01-16T10:45:00Z",
        likes: 3,
        isLiked: false,
        replies: []
      },
      {
        id: "3",
        postId,
        userId: "4",
        username: "王五",
        userAvatar: "https://picsum.photos/seed/user4/100/100.jpg",
        content: "有没有关于如何从Next.js 13升级到14的详细指南？我在升级过程中遇到了一些问题。",
        createdAt: "2024-01-16T14:20:00Z",
        updatedAt: "2024-01-16T14:20:00Z",
        likes: 1,
        isLiked: false,
        replies: [
          {
            id: "3-1",
            postId,
            userId: "1",
            username: "文章作者",
            userAvatar: "https://picsum.photos/seed/author1/100/100.jpg",
            content: "我正在准备一篇关于升级指南的文章，会在本周发布。请关注后续更新！",
            createdAt: "2024-01-16T15:05:00Z",
            updatedAt: "2024-01-16T15:05:00Z",
            likes: 4,
            isLiked: false
          },
          {
            id: "3-2",
            postId,
            userId: "5",
            username: "赵六",
            userAvatar: "https://picsum.photos/seed/user5/100/100.jpg",
            content: "我也遇到了升级问题，主要是服务器组件的兼容性。期待你的升级指南！",
            createdAt: "2024-01-16T16:30:00Z",
            updatedAt: "2024-01-16T16:30:00Z",
            likes: 2,
            isLiked: false
          }
        ]
      }
    ];

    // 根据排序方式排序
    let sortedComments = [...mockComments];
    if (sortBy === 'oldest') {
      sortedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'popular') {
      sortedComments.sort((a, b) => b.likes - a.likes);
    } else { // newest
      sortedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 分页
    const total = sortedComments.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = sortedComments.slice(startIndex, endIndex);

    return {
      comments: paginatedComments,
      total,
      page,
      limit
    };
  }

  // 创建评论
  static async createComment(data: CommentCreateData): Promise<Comment> {
    // 在实际应用中，这里应该调用API
    // return apiClient.post<Comment>('/comments', data);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟创建评论
    const newComment: Comment = {
      id: Date.now().toString(),
      postId: data.postId,
      userId: "1", // 当前用户ID
      username: "当前用户",
      userAvatar: "https://picsum.photos/seed/currentuser/100/100.jpg",
      content: data.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    return newComment;
  }

  // 更新评论
  static async updateComment(commentId: string, data: CommentUpdateData): Promise<Comment> {
    // 在实际应用中，这里应该调用API
    // return apiClient.put<Comment>(`/comments/${commentId}`, data);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 400));

    // 模拟更新评论
    const updatedComment: Comment = {
      id: commentId,
      postId: "1", // 假设的文章ID
      userId: "1",
      username: "当前用户",
      userAvatar: "https://picsum.photos/seed/currentuser/100/100.jpg",
      content: data.content,
      createdAt: "2024-01-15T10:00:00Z", // 原始创建时间
      updatedAt: new Date().toISOString(), // 更新时间
      likes: 0,
      isLiked: false
    };

    return updatedComment;
  }

  // 删除评论
  static async deleteComment(commentId: string): Promise<{ success: boolean }> {
    // 在实际应用中，这里应该调用API
    // return apiClient.delete<{ success: boolean }>(`/comments/${commentId}`);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 模拟删除成功
    return { success: true };
  }

  // 点赞评论
  static async likeComment(commentId: string): Promise<{ success: boolean; likes: number; isLiked: boolean }> {
    // 在实际应用中，这里应该调用API
    // return apiClient.post<{ success: boolean; likes: number; isLiked: boolean }>(`/comments/${commentId}/like`);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200));

    // 模拟点赞成功
    return {
      success: true,
      likes: 10,
      isLiked: true
    };
  }

  // 取消点赞评论
  static async unlikeComment(commentId: string): Promise<{ success: boolean; likes: number; isLiked: boolean }> {
    // 在实际应用中，这里应该调用API
    // return apiClient.delete<{ success: boolean; likes: number; isLiked: boolean }>(`/comments/${commentId}/like`);

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200));

    // 模拟取消点赞成功
    return {
      success: true,
      likes: 9,
      isLiked: false
    };
  }

  // 举报评论
  static async reportComment(commentId: string, reason: string): Promise<{ success: boolean }> {
    // 在实际应用中，这里应该调用API
    // return apiClient.post<{ success: boolean }>(`/comments/${commentId}/report`, { reason });

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 模拟举报成功
    return { success: true };
  }
}

export default CommentService;