import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// 模拟评论数据
const mockComments = [
  {
    id: '1',
    postId: '1',
    author: {
      id: 'user1',
      username: '张三',
      avatar: 'https://picsum.photos/seed/user1/100/100.jpg'
    },
    content: '这篇文章写得非常好，学到了很多东西！',
    createdAt: new Date('2024-01-16'),
    likes: 5,
    replies: [
      {
        id: '2',
        postId: '1',
        parentId: '1',
        author: {
          id: 'user2',
          username: '李四',
          avatar: 'https://picsum.photos/seed/user2/100/100.jpg'
        },
        content: '同意，我也觉得很有收获！',
        createdAt: new Date('2024-01-17'),
        likes: 2
      }
    ]
  },
  {
    id: '3',
    postId: '1',
    author: {
      id: 'user3',
      username: '王五',
      avatar: 'https://picsum.photos/seed/user3/100/100.jpg'
    },
    content: '感谢分享，期待更多优质内容！',
    createdAt: new Date('2024-01-18'),
    likes: 3,
    replies: []
  }
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const postId = searchParams.get('postId')

  if (!postId) {
    return NextResponse.json({
      ok: false,
      error: 'postId is required'
    }, { status: 400 })
  }

  try {
    // 获取指定文章的评论
    const comments = mockComments.filter(comment => comment.postId === postId)

    return NextResponse.json({
      ok: true,
      data: comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch comments'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, content, parentId } = body

    if (!postId || !content) {
      return NextResponse.json({
        ok: false,
        error: 'postId and content are required'
      }, { status: 400 })
    }

    // 模拟提交评论
    const newComment = {
      id: Date.now().toString(),
      postId,
      parentId,
      author: {
        id: 'currentUser',
        username: '当前用户',
        avatar: 'https://picsum.photos/seed/currentUser/100/100.jpg'
      },
      content,
      createdAt: new Date(),
      likes: 0,
      replies: []
    }

    // 在实际应用中，这里应该保存到数据库
    // mockComments.push(newComment)

    return NextResponse.json({
      ok: true,
      data: newComment
    }, { status: 201 })
  } catch (error) {
    console.error('Error submitting comment:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to submit comment'
    }, { status: 500 })
  }
}
