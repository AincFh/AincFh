import { Form, redirect } from "react-router";
import type { Route } from "./+types/admin.anime.manage";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionId } from "~/utils/auth";
import { useState } from "react";
import { RadarChart } from "~/components/ui/system/RadarChart";
import { QuickSyncButton } from "~/components/admin/QuickSyncButton";

export async function loader({ request, context }: Route.LoaderArgs) {
    // 验证管理员权限 (admin_session)
    const sessionId = request.headers.get("Cookie")?.match(/admin_session=([^;]+)/)?.[1];
    if (!sessionId) {
        throw redirect("/admin/login");
    }

    const { anime_db, DB } = context.cloudflare.env;

    if (DB) {
        // 验证 session 有效性
        try {
            const session = await DB.prepare(
                "SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')"
            ).bind(sessionId).first();

            if (!session) {
                throw redirect("/admin/login");
            }
        } catch (e) {
             throw redirect("/admin/login");
        }
    }

    try {
        const { results } = await anime_db
            .prepare("SELECT * FROM animes ORDER BY created_at DESC")
            .all();

        return { animes: results || [] };
    } catch (error) {
        console.error("Failed to fetch animes:", error);
        return { animes: [] };
    }
}

export async function action({ request, context }: Route.ActionArgs) {
    // 验证管理员权限 (admin_session)
    const sessionId = request.headers.get("Cookie")?.match(/admin_session=([^;]+)/)?.[1];
    const { anime_db, DB } = context.cloudflare.env;

    if (!sessionId) {
        throw redirect("/admin/login");
    }

    if (DB) {
        // 验证 session 有效性
        try {
            const session = await DB.prepare(
                "SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')"
            ).bind(sessionId).first();

            if (!session) {
                throw redirect("/admin/login");
            }
        } catch (e) {
            console.error("Session verification failed", e);
            throw redirect("/admin/login");
        }
    }

    try {
        const formData = await request.formData();
        const action = formData.get("_action") as string;

        if (action === "create") {
            const title = formData.get("title") as string;
            const cover_url = formData.get("cover_url") as string;
            const status = formData.get("status") as string;
            const progress = formData.get("progress") as string;
            const rating = formData.get("rating") ? parseInt(formData.get("rating") as string) : null;
            const review = formData.get("review") as string;

            const rating_radar = formData.get("rating_radar") as string;
            const radarData = rating_radar ? JSON.parse(rating_radar) : null;

            await anime_db
                .prepare(
                    `INSERT INTO animes (title, cover_url, status, progress, rating, rating_radar, review)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
                )
                .bind(
                    title,
                    cover_url || null,
                    status,
                    progress || null,
                    rating,
                    radarData ? JSON.stringify(radarData) : null,
                    review || null
                )
                .run();

            return { success: true };
        } else if (action === "delete") {
            const id = formData.get("id") as string;
            await anime_db
                .prepare("DELETE FROM animes WHERE id = ?")
                .bind(id)
                .run();

            return { success: true };
        }

        return { success: false };
    } catch (error) {
        console.error("Anime action error:", error);
        return { success: false, error: "操作失败" };
    }
}

export default function AnimeManage({ loaderData }: Route.ComponentProps) {
    const { animes } = loaderData;
    const [showForm, setShowForm] = useState(false);
    const [selectedAnime, setSelectedAnime] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const statusLabels: Record<string, string> = {
        watching: "在看",
        completed: "看过",
        plan: "想看",
        dropped: "弃番",
    };

    const statusColors: Record<string, string> = {
        watching: "bg-blue-100 text-blue-700 border-blue-200",
        completed: "bg-green-100 text-green-700 border-green-200",
        plan: "bg-purple-100 text-purple-700 border-purple-200",
        dropped: "bg-gray-100 text-gray-700 border-gray-200",
    };

    // 默认雷达图数据
    const defaultRadarData = {
        plot: 8,
        animation: 8,
        voice: 8,
        music: 8,
        character: 8,
        passion: 8,
    };

    const [radarData, setRadarData] = useState(defaultRadarData);

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">番剧记录</h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="🔍 搜索番剧..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                        />
                        <motion.button
                            onClick={() => setShowForm(!showForm)}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-shadow"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            + 录入新番
                        </motion.button>
                    </div>
                </div>

                {/* 添加新番剧表单 */}
                {showForm && (
                    <motion.div
                        className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-6 text-gray-800">录入新番</h2>
                        <Form method="post" className="space-y-4">
                            <input type="hidden" name="_action" value="create" />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    placeholder="番剧名称"
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                                />
                                <input
                                    type="url"
                                    name="cover_url"
                                    placeholder="封面 URL"
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <select
                                    name="status"
                                    required
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                                >
                                    <option value="watching">在看</option>
                                    <option value="completed">看过</option>
                                    <option value="plan">想看</option>
                                    <option value="dropped">弃番</option>
                                </select>
                                <input
                                    type="text"
                                    name="progress"
                                    placeholder="进度 (如: 12/24)"
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                                />
                                <input
                                    type="number"
                                    name="rating"
                                    min="1"
                                    max="10"
                                    placeholder="评分 (1-10)"
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                                />
                            </div>
                            <textarea
                                name="review"
                                rows={2}
                                placeholder="短评..."
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                            />
                            <motion.button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowForm(false)}
                            >
                                添加番剧
                            </motion.button>
                        </Form>
                    </motion.div>
                )}

                {/* 海报墙模式 */}
                <div>
                    <h2 className="text-xl font-bold mb-6 text-gray-800">我的收藏架</h2>
                    {animes && animes.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {animes
                                .filter((anime: any) =>
                                    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((anime: any, index: number) => (
                                    <motion.div
                                        key={anime.id}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -8 }}
                                        onClick={() => {
                                            setSelectedAnime(anime);
                                            if (anime.rating_radar) {
                                                setRadarData(JSON.parse(anime.rating_radar));
                                            } else {
                                                setRadarData(defaultRadarData);
                                            }
                                        }}
                                    >
                                        {/* 封面 */}
                                        <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                                            {anime.cover_url ? (
                                                <img
                                                    src={anime.cover_url}
                                                    alt={anime.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    🎬
                                                </div>
                                            )}
                                            {/* 状态标签 */}
                                            <div className="absolute top-2 right-2">
                                                <span
                                                    className={`px-2 py-1 rounded-lg text-xs font-bold border ${statusColors[anime.status] || statusColors.plan}`}
                                                >
                                                    {statusLabels[anime.status] || "未知"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 信息 */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">
                                                {anime.title}
                                            </h3>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                {anime.rating && (
                                                    <span className="text-yellow-500 font-mono">
                                                        ★ {anime.rating}/10
                                                    </span>
                                                )}
                                                {anime.progress && (
                                                    <span className="font-mono">{anime.progress}</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-gray-100">
                            <p className="text-lg mb-2">收藏架还是空的</p>
                            <p className="text-sm">点击"录入新番"开始收藏吧！</p>
                        </div>
                    )}
                </div>

                {/* 侧滑编辑抽屉 */}
                <AnimatePresence>
                    {selectedAnime && (
                        <>
                            {/* 遮罩层 */}
                            <motion.div
                                className="fixed inset-0 bg-black/50 z-40"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedAnime(null)}
                            />
                            {/* 抽屉 */}
                            <motion.div
                                className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">编辑番剧</h2>
                                        <motion.button
                                            onClick={() => setSelectedAnime(null)}
                                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            ✕
                                        </motion.button>
                                    </div>

                                    {selectedAnime.cover_url && (
                                        <img
                                            src={selectedAnime.cover_url}
                                            alt={selectedAnime.title}
                                            className="w-full rounded-xl mb-6"
                                        />
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                标题
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={selectedAnime.title}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                状态
                                            </label>
                                            <select
                                                defaultValue={selectedAnime.status}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                                            >
                                                <option value="watching">在看</option>
                                                <option value="completed">看过</option>
                                                <option value="plan">想看</option>
                                                <option value="dropped">弃番</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                进度
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    defaultValue={selectedAnime.progress || ""}
                                                    placeholder="12/24"
                                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                                                />
                                                {/* 一键同步按钮 */}
                                                {selectedAnime.status === "watching" && selectedAnime.progress && (
                                                    <QuickSyncButton
                                                        animeId={selectedAnime.id}
                                                        currentProgress={selectedAnime.progress}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* 雷达图评测 */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                                雷达图评测（拖动顶点调整）
                                            </label>
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <RadarChart data={radarData} size={200} />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                💡 提示：点击并拖动雷达图的顶点来调整评分
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                短评
                                            </label>
                                            <textarea
                                                defaultValue={selectedAnime.review || ""}
                                                rows={3}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 resize-none"
                                                placeholder="写下你的观后感..."
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <motion.button
                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                保存修改
                                            </motion.button>
                                            <Form method="post">
                                                <input type="hidden" name="_action" value="delete" />
                                                <input type="hidden" name="id" value={selectedAnime.id} />
                                                <motion.button
                                                    type="submit"
                                                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={(e) => {
                                                        if (!confirm("确定要删除这部番剧吗？")) {
                                                            e.preventDefault();
                                                        } else {
                                                            setSelectedAnime(null);
                                                        }
                                                    }}
                                                >
                                                    删除
                                                </motion.button>
                                            </Form>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
