import type { Route } from "./+types/api.animes";

export async function loader({ context }: Route.LoaderArgs) {
    const { anime_db } = context.cloudflare.env;

    try {
        // 获取所有番剧，按状态和创建时间排序
        const { results } = await anime_db
            .prepare(
                `SELECT * FROM animes
         ORDER BY
           CASE status
             WHEN 'watching' THEN 1
             WHEN 'completed' THEN 2
             WHEN 'plan' THEN 3
             WHEN 'dropped' THEN 4
           END,
           created_at DESC
         LIMIT 50`
            )
            .all();

        return Response.json({ animes: results });
    } catch (error) {
        console.error("Failed to fetch animes:", error);
        return Response.json({ animes: [], error: "Failed to fetch animes" }, { status: 500 });
    }
}

export async function action({ request, context }: Route.ActionArgs) {
    // 1. 验证管理员权限
    const sessionId = request.headers.get("Cookie")?.match(/admin_session=([^;]+)/)?.[1];
    const { anime_db, DB } = context.cloudflare.env;

    if (!sessionId || !DB) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const session = await DB.prepare(
            "SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')"
        ).bind(sessionId).first();

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
    } catch (e) {
        return Response.json({ error: "Auth check failed" }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const method = request.method;

        if (method === "POST") {
            // 创建新的番剧记录
            const title = formData.get("title") as string;
            const cover_url = formData.get("cover_url") as string;
            const status = formData.get("status") as string;
            const progress = formData.get("progress") as string;
            const rating = formData.get("rating") ? parseInt(formData.get("rating") as string) : null;
            const review = formData.get("review") as string;

            await anime_db
                .prepare(
                    `INSERT INTO animes (title, cover_url, status, progress, rating, review)
           VALUES (?, ?, ?, ?, ?, ?)`
                )
                .bind(title, cover_url, status, progress, rating, review)
                .run();

            return Response.json({ success: true });
        } else if (method === "PUT") {
            // 更新番剧记录
            const id = formData.get("id") as string;
            const title = formData.get("title") as string;
            const cover_url = formData.get("cover_url") as string;
            const status = formData.get("status") as string;
            const progress = formData.get("progress") as string;
            const rating = formData.get("rating") ? parseInt(formData.get("rating") as string) : null;
            const review = formData.get("review") as string;

            await anime_db
                .prepare(
                    `UPDATE animes
           SET title = ?, cover_url = ?, status = ?, progress = ?, rating = ?, review = ?
           WHERE id = ?`
                )
                .bind(title, cover_url, status, progress, rating, review, id)
                .run();

            return Response.json({ success: true });
        } else if (method === "DELETE") {
            // 删除番剧记录
            const id = formData.get("id") as string;

            await anime_db
                .prepare(`DELETE FROM animes WHERE id = ?`)
                .bind(id)
                .run();

            return Response.json({ success: true });
        }

        return Response.json({ error: "Method not allowed" }, { status: 405 });
    } catch (error) {
        console.error("Anime action error:", error);
        return Response.json({ error: "Action failed" }, { status: 500 });
    }
}
