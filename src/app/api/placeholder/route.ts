export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const width = searchParams.get('width') || '800';
  const height = searchParams.get('height') || '600';
  const text = searchParams.get('text') || 'Placeholder';

  // 创建SVG占位符图
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect width="100%" height="100%" fill="url(#gradient)" opacity="0.1"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="#6b7280" text-anchor="middle" dy=".3em">
        ${text.replace(/\+/g, ' ')}
      </text>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  // 将SVG转换为base64
  const base64 = Buffer.from(svg).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${base64}`;

  // 返回重定向到data URL
  return NextResponse.redirect(dataUrl);
}
