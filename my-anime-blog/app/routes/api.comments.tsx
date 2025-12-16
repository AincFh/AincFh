import type { Route } from "./+types/api.comments";
import { isSpamComment, sanitizeComment, jsonWithSecurity } from "~/utils/security";
import { json } from "@remix-run/cloudflare";

/**
 * 评论API
 * 功能：处理评论提交，包含Turnstile验证和关键词拦截
 */
export async function action({ request, context }: Route.ActionArgs) {
  const { anime_db } = context.cloudflare.env;
  const formData = await request.formData();

  const content = formData.get("content") as string;
  const articleId = formData.get("article_id") as string;
  const author = formData.get("author") as string;
  const turnstileToken = formData.get("cf-turnstile-response") as string;

  // 1. 验证Turnstile Token
  if (!turnstileToken) {
    return Response.json({ error: "请完成人机验证" }, { status: 400 });
  }

  // 验证Turnstile Token
  const turnstileSecret = context.cloudflare.env.TURNSTILE_SECRET;
  if (turnstileSecret) {
    try {
      const verifyResponse = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
        }
      );

      if (!verifyResponse.ok) {
        return jsonWithSecurity({ error: "验证服务异常" }, { status: 500 });
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.success) {
        return jsonWithSecurity({ error: "人机验证失败" }, { status: 400 });
      }
    } catch (error) {
      console.error('Turnstile verification error:', error);
      return jsonWithSecurity({ error: '验证服务不可用' }, { status: 500 });
    }
  } else {
    // 开发环境：记录警告但不阻断
    console.warn('TURNSTILE_SECRET not configured, skipping verification');
  }

  // 2. 清理和验证内容
  const cleanedContent = sanitizeComment(content);
  if (!cleanedContent || cleanedContent.length < 3) {
    return Response.json({ error: "评论内容太短" }, { status: 400 });
  }

  // 3. 关键词拦截
  if (isSpamComment(cleanedContent)) {
    // 直接标记为垃圾评论，不返回错误（避免被攻击者知道规则）
    try {
      await anime_db
        .prepare(
          `INSERT INTO comments (article_id, author, content, is_danmaku, status, is_spam)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(articleId, author || "匿名", cleanedContent, false, "pending", true)
        .run();
    } catch (error) {
      console.error("Failed to save spam comment:", error);
    }
    // 返回成功，但实际已标记为垃圾
    return Response.json({ success: true, message: "评论已提交，待审核" });
  }

  // 4. 保存正常评论
  try {
    await anime_db
      .prepare(
        `INSERT INTO comments (article_id, author, content, is_danmaku, status, is_spam)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(articleId, author || "匿名", cleanedContent, false, "approved", false)
      .run();

    return jsonWithSecurity({ success: true, message: "评论已提交" });
  } catch (error) {
    console.error("Failed to save comment:", error);
    return jsonWithSecurity({ error: "评论提交失败" }, { status: 500 });
  }
}
