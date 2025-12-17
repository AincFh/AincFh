export const runtime = 'edge';

// Next.js 13 route handler for admin profile data
import { NextResponse } from 'next/server';

// Mock database (in real app replace with DB calls)
let mockProfile = {
    username: 'Admin User',
    role: '超级管理员',
    email: 'admin@blog.com',
    bio: '热爱技术，专注于Web 开发和内容创作。喜欢探索新技术，分享编程经验。',
    phone: '138 0000 8888',
    location: '上海, 中国',
    website: 'https://blog.example.com',
    github: 'github.com/admin',
    twitter: '@admin_blog',
    avatar: ''
};

export async function GET() {
    return NextResponse.json(mockProfile);
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Simple merge update
        mockProfile = { ...mockProfile, ...data };
        return NextResponse.json({ success: true, profile: mockProfile });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }
}
