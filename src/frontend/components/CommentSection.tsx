"use client";

import { useState, useEffect } from 'react';
import { User, Send, Heart, Reply, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

interface CommentAuthor {
  id: string;
  username: string;
  avatar: string;
}

interface Comment {
  id: string;
  postId: string;
  author: CommentAuthor;
  content: string;
  createdAt: Date;
  likes: number;
  status: 'approved' | 'pending' | 'rejected';
  replies: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  // 模拟获取评论
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/frontend/comments?postId=${postId}`);
        const data = await response.json();
        if (data.ok) {
          setComments(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // 提交评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch('/api/frontend/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: newComment.trim(),
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setComments([data.data, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  // 提交回复
  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const response = await fetch('/api/frontend/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: replyContent.trim(),
          parentId,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        // 更新评论列表，添加回复
        setComments(comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...comment.replies, data.data],
            };
          }
          return comment;
        }));
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  // 点赞评论
  const handleLikeComment = (commentId: string) => {
    setLikes(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

    // 更新评论点赞数
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: likes[commentId] ? comment.likes - 1 : comment.likes + 1,
        };
      }
      // 检查回复
      const updatedReplies = comment.replies.map(reply => {
        if (reply.id === commentId) {
          return {
            ...reply,
            likes: likes[commentId] ? reply.likes - 1 : reply.likes + 1,
          };
        }
        return reply;
      });
      return {
        ...comment,
        replies: updatedReplies,
      };
    }));
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-8">评论 ({comments.length})</h2>

      {/* 评论表单 */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">添加评论</h3>
        <form onSubmit={handleSubmitComment} className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              <User className="w-6 h-6 text-gray-500 dark:text-gray-400 m-auto" />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="写下你的评论..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
              />
              <div className="flex justify-end">
                <Button type="submit" variant="default" size="sm" rightIcon={<Send className="w-4 h-4" />}>
                  发布评论
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 评论列表 */}
      {loading ? (
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>还没有评论，快来抢沙发吧！</p>
        </div>
      ) : (
        <div className="space-y-8">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {comment.author.username}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {comment.status === 'pending' && (
                      <span className="text-xs text-yellow-500">待审核</span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${likes[comment.id] ? 'fill-red-500 text-red-500' : ''}`}
                      />
                      <span>{comment.likes}</span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span>回复</span>
                    </button>
                  </div>

                  {/* 回复表单 */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <form
                        onSubmit={(e) => handleSubmitReply(e, comment.id)}
                        className="flex gap-3"
                      >
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder={`回复 @${comment.author.username}...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="default"
                          size="sm"
                          rightIcon={<Send className="w-4 h-4" />}
                        >
                          回复
                        </Button>
                      </form>
                    </div>
                  )}
                </div>

                {/* 回复列表 */}
                {comment.replies.length > 0 && (
                  <div className="ml-14 mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={reply.author.avatar}
                            alt={reply.author.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm text-gray-900 dark:text-white">
                                  {reply.author.username}
                                </h5>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {reply.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <button
                                onClick={() => handleLikeComment(reply.id)}
                                className="flex items-center gap-1 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              >
                                <Heart
                                  className={`w-3 h-3 ${likes[reply.id] ? 'fill-red-500 text-red-500' : ''}`}
                                />
                                <span>{reply.likes}</span>
                              </button>
                              <button
                                onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                                className="flex items-center gap-1 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                              >
                                <Reply className="w-3 h-3" />
                                <span>回复</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
