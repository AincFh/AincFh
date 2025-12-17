import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../auth'

export const runtime = 'edge'

// 模拟媒体数据
const mockMedia = [
  {
    id: '1',
    name: 'nextjs-14.jpg',
    url: '/api/placeholder/1200/600?text=Next.js+14',
    type: 'image',
    size: '2.5 MB',
    uploadedAt: new Date('2024-01-15'),
    uploadedBy: 'admin'
  },
  {
    id: '2',
    name: 'typescript.jpg',
    url: '/api/placeholder/1200/600?text=TypeScript',
    type: 'image',
    size: '1.8 MB',
    uploadedAt: new Date('2024-01-12'),
    uploadedBy: 'admin'
  },
  {
    id: '3',
    name: 'react-performance.mp4',
    url: '/api/placeholder/1200/600?text=React+Performance',
    type: 'video',
    size: '15.2 MB',
    uploadedAt: new Date('2024-01-10'),
    uploadedBy: 'admin'
  }
]

// 获取媒体列表
export const GET = withAuth(async (request: Request) => {
  const nextRequest = request as NextRequest;
  const searchParams = nextRequest.nextUrl.searchParams

  // 获取查询参数
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const type = searchParams.get('type') || undefined

  try {
    // 过滤媒体
    let filteredMedia = [...mockMedia]

    if (type) {
      filteredMedia = filteredMedia.filter(media => media.type === type)
    }

    // 分页
    const total = filteredMedia.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const media = filteredMedia.slice(startIndex, endIndex)

    return NextResponse.json({
      ok: true,
      data: media,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch media'
    }, { status: 500 })
  }
})

// 上传媒体
export const POST = withAuth(async (request: Request) => {
  try {
    // 在实际应用中，这里应该处理文件上传
    // const formData = await request.formData()
    // const file = formData.get('file') as File

    // 模拟上传媒体
    const newMedia = {
      id: Date.now().toString(),
      name: 'uploaded-file.jpg',
      url: '/api/placeholder/1200/600?text=Uploaded+File',
      type: 'image',
      size: '3.2 MB',
      uploadedAt: new Date(),
      uploadedBy: 'admin'
    }

    // 在实际应用中，这里应该调用MediaService.uploadMedia(file)

    return NextResponse.json({
      ok: true,
      data: newMedia
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to upload media'
    }, { status: 500 })
  }
})

// 删除媒体
export const DELETE = withAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { mediaIds } = body

    if (!mediaIds || !Array.isArray(mediaIds)) {
      return NextResponse.json({
        ok: false,
        error: 'mediaIds is required'
      }, { status: 400 })
    }

    // 模拟删除媒体
    // 在实际应用中，这里应该调用MediaService.deleteMedia(mediaIds)

    return NextResponse.json({
      ok: true,
      message: 'Media deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json({
      ok: false,
      error: 'Failed to delete media'
    }, { status: 500 })
  }
})
