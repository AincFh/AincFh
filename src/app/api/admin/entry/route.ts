export const runtime = 'edge';

// src/app/api/admin/entry/route.ts
import { NextResponse } from 'next/server';

// Mock list of admin modules (can be extended later)
const adminModules = [
    { name: 'profile', path: '/admin/profile' },
    { name: 'articles', path: '/admin/articles' },
    { name: 'comments', path: '/admin/comments' },
    { name: 'settings', path: '/admin/settings' },
    { name: 'designer', path: '/admin/designer' },
];

export async function GET() {
    return NextResponse.json({ modules: adminModules }, { status: 200 });
}

export async function POST(request: Request) {
    // Placeholder for future bulk actions or commands
    const body = await request.json();
    console.log('Admin entry POST payload:', body);
    return NextResponse.json({ message: 'Action received' }, { status: 200 });
}
