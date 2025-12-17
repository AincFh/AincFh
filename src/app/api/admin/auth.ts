// src/app/api/admin/auth.ts

/**
 * Simple auth wrapper for API routes.
 * In production replace with next-auth or JWT verification.
 */
export function withAuth(handler: (req: Request) => Promise<Response>) {
    return async (request: Request) => {
        const authHeader = request.headers.get('Authorization') || '';
        // Expect format: Bearer <token>
        if (!authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        // TODO: verify token here. For now, allow any token.
        return handler(request);
    };
}
