export const runtime = 'edge';

// src/app/api/admin/designer/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '../auth';
import { z } from 'zod';

// Zod schema for validation (matches implementation plan)
const designerSchema = z.object({
    siteTitle: z.string().min(1),
    siteDescription: z.string().optional(),
    logoUrl: z.string().url().optional(),
    navigation: z.array(z.object({ label: z.string(), href: z.string() })),
    theme: z.object({ primary: z.string(), secondary: z.string(), background: z.string() }),
    features: z.object({ comments: z.boolean(), seo: z.boolean() })
});

// In‑memory mock storage for development
let designerConfig: z.infer<typeof designerSchema> = {
    siteTitle: 'My Site',
    siteDescription: 'A description',
    logoUrl: '',
    navigation: [{ label: 'Home', href: '/' }],
    theme: { primary: '#2563eb', secondary: '#10b981', background: '#f9fafb' },
    features: { comments: true, seo: true }
};

async function getHandler(_request: Request) {
    return NextResponse.json({ config: designerConfig }, { status: 200 });
}

async function postHandler(request: Request) {
    try {
        const payload = await request.json();
        const parsed = designerSchema.parse(payload);
        designerConfig = parsed; // replace with new config
        return NextResponse.json({ success: true, config: designerConfig }, { status: 200 });
    } catch (e) {
        console.error('Designer POST validation error', e);
        return NextResponse.json({ error: 'Invalid payload', details: e instanceof Error ? e.message : String(e) }, { status: 400 });
    }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
