import { motion } from "framer-motion";
import { Link, Outlet, useLocation, redirect } from "react-router";
import type { Route } from "./+types/admin";
import { TrafficRadar } from "~/components/admin/TrafficRadar";
import { CommentManager } from "~/components/admin/CommentManager";
import { MemoPad } from "~/components/admin/MemoPad";
import { SystemHealth } from "~/components/admin/SystemHealth";
import { DailyQuests } from "~/components/admin/DailyQuests";

export async function loader({ request, context }: Route.LoaderArgs) {
  // 检查 admin_session cookie
  const sessionId = request.headers.get("Cookie")?.match(/admin_session=([^;]+)/)?.[1];

  // 安全检查：本地开发环境可能没有 cloudflare context
  const db = (context?.cloudflare?.env as any)?.DB;

  // 如果没有数据库连接（本地开发模式）
  if (!db) {
    // 本地开发模式：检查是否有 admin_session cookie
    if (!sessionId) {
      throw redirect("/login-admin");
    }

    // 有 session，返回模拟数据
    console.warn("Local dev mode: using mock data");
    return {
      stats: {
        pv: 1234,
        uv: 800,
        articles: 42,
        words: 0,
        comments: 88,
        likes: 28,
        storage: 1200,
      },
    };
  }

  // 生产环境：验证 session 是否有效
  if (!sessionId) {
    throw redirect("/login-admin");
  }

  try {
    const session = await db.prepare(
      "SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')"
    ).bind(sessionId).first();

    if (!session) {
      throw redirect("/login-admin");
    }
  } catch (e) {
    throw redirect("/login-admin");
  }

  return {
    stats: {
      pv: 1234, // 今日PV
      uv: 800, // 今日UV
      articles: 42, // 文章总数
      words: 0, // 总字数
      comments: 88, // 评论数
      likes: 28, // 点赞数
      storage: 1200, // R2存储使用量（MB）
    },
  };
}

export default function Admin({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  const isRoot = location.pathname === "/admin";
  const { stats } = loaderData;

  if (!isRoot) {
    return <Outlet />;
  }

  // RPG风格状态卡片（使用等宽字体）
  const StatCard = ({
    title,
    value,
    max,
    color,
    icon,
    unit = "",
    percentage,
  }: {
    title: string;
    value: number;
    max: number;
    color: string;
    icon: string;
    unit?: string;
    percentage: number;
  }) => {
    return (
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <h3 className="font-bold text-gray-800">{title}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono" style={{ color }}>
              {value.toLocaleString()}
              {unit}
            </div>
            {max > 0 && (
              <div className="text-xs text-gray-500 font-mono">/ {max.toLocaleString()}</div>
            )}
          </div>
        </div>
        {/* 进度条 */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    );
  };

  // 系统日志
  const systemLogs = [
    { time: "10:00", action: "数据库备份成功", icon: "✅" },
    { time: "09:30", action: "拦截一次恶意攻击", icon: "🛡️" },
    { time: "08:15", action: "缓存刷新完成", icon: "🔄" },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-8">指挥中心</h1>

        {/* 第一行：RPG 属性卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="HP (今日访问)"
            value={stats.pv}
            max={2000}
            color="#EF4444"
            icon="❤️"
            unit=" PV"
            percentage={70}
          />
          <StatCard
            title="MP (文章数)"
            value={stats.articles}
            max={100}
            color="#3B82F6"
            icon="💙"
            unit=" 篇"
            percentage={42}
          />
          <StatCard
            title="EXP (总互动)"
            value={stats.comments}
            max={100}
            color="#F59E0B"
            icon="⭐"
            unit=" 条评论"
            percentage={88}
          />
          <StatCard
            title="Bag (R2存储)"
            value={stats.storage}
            max={10000}
            color="#10B981"
            icon="🎒"
            unit=" MB"
            percentage={12}
          />
        </div>

        {/* 第二行：主控区 - 3栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* 流量雷达 (50%) */}
          <div className="lg:col-span-6">
            <TrafficRadar />
          </div>

          {/* 每日任务 (25%) */}
          <div className="lg:col-span-3">
            <DailyQuests />
          </div>

          {/* 灵感便签 (25%) */}
          <div className="lg:col-span-3">
            <MemoPad />
          </div>
        </div>

        {/* 第三行：日志区 - 2栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 系统日志 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🚀 系统日志
            </h2>
            <div className="space-y-3">
              {systemLogs.map((log, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-xl">{log.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{log.action}</p>
                    <p className="text-xs text-gray-500 font-mono">{log.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 最新留言 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              💬 最新留言
            </h2>
            <div className="space-y-3">
              <CommentManager />
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/article/new">
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl mb-4">✍️</span>
                <h3 className="font-bold text-pink-600 mb-2">撰写手记</h3>
                <p className="text-sm text-gray-500">开始创作新内容</p>
              </div>
            </motion.div>
          </Link>

          <Link to="/admin/anime/manage">
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl mb-4">🎬</span>
                <h3 className="font-bold text-blue-500 mb-2">番剧记录</h3>
                <p className="text-sm text-gray-500">管理我的追番</p>
              </div>
            </motion.div>
          </Link>

          <Link to="/admin/gallery">
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl mb-4">🖼️</span>
                <h3 className="font-bold text-purple-500 mb-2">影像仓库</h3>
                <p className="text-sm text-gray-500">管理图片资源</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
