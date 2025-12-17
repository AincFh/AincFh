"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const router = useRouter();

  const sections = [
    { id: "general", title: "总则" },
    { id: "account", title: "账户管理" },
    { id: "content", title: "内容规范" },
    { id: "privacy", title: "隐私保护" },
    { id: "personalization", title: "个性化推荐与数据使用" },
    { id: "intellectual", title: "知识产权" },
    { id: "liability", title: "责任限制" },
    { id: "termination", title: "服务终止" },
    { id: "miscellaneous", title: "其他条款" }
  ];

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/register" className="inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回注册页面
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">服务条款</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            欢迎使用本博客服务，请在使用前仔细阅读以下条�?          </p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
            最后更新日期：2024�?�?�?          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
              <nav className="sticky top-8 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
              {/* 总则 */}
              {activeSection === "general" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">1. 总则</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      欢迎使用本博客服务（以下简�?本服�?）。本服务条款（以下简�?条款"）是您与本博客之间关于使用本服务的法律协议�?                    </p>
                    <p>
                      通过注册、访问或以其他方式使用本服务，您表示同意接受本条款的所有内容和条件。如果您不同意本条款的任何内容，请停止使用本服务�?                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">1.1 服务说明</h3>
                    <p>
                      本博客是一个提供技术分享、创意展示和生活记录的在线平台。用户可以通过注册账户，发布文章、评论互动、订阅内容等功能�?                    </p>
                    <p>
                      我们提供的服务包括但不限于：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>创建、发布和管理个人博客内容</li>
                      <li>浏览、评论和互动其他用户的博客内容</li>
                      <li>个性化博客主题和布局</li>
                      <li>博客内容分析和统计</li>
                      <li>社区交流和互动功能</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">1.2 条款修改</h3>
                    <p>
                      本博客保留随时修改本条款的权利，修改后的条款将在网站上公布。继续使用本服务即表示您接受修改后的条款�?                    </p>
                    <p>
                      重大变更将通过电子邮件或服务内通知通知您。如果您不同意修改后的条款，您可以在修改生效后停止使用本服务�?                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">1.3 接受条款</h3>
                    <p>
                      通过以下方式之一，即表示您接受本条款：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>点击同意本条款的复选框</li>
                      <li>注册或使用本服务</li>
                      <li>继续使用本服务（在条款修改后）</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 账户管理 */}
              {activeSection === "account" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">2. 账户管理</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-6 mb-3">2.1 账户注册</h3>
                    <p>
                      您需要提供真实、准确、完整的个人信息来注册账户。您有责任维护账户信息的及时更新，并确保信息的真实性和准确性�?                    </p>
                    <p>
                      注册时，您必须：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>提供真实、准确、完整的个人信息</li>
                      <li>选择安全的密码并定期更换</li>
                      <li>提供有效的电子邮箱地址用于接收通知</li>
                      <li>同意接收与服务相关的重要通知</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">2.2 账户安全</h3>
                    <p>
                      您有责任保护账户密码的安全性，不得将账户转让给第三方。您应对通过您的账户进行的所有活动承担责任�?                    </p>
                    <p>
                      如果您发现任何未经授权使用您账户的情况，请立即：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>更改您的密码</li>
                      <li>通知我们的客服团队</li>
                      <li>检查账户活动记录</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">2.3 账户使用</h3>
                    <p>
                      您同意不会：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>创建多个账户</li>
                      <li>使用他人的账户</li>
                      <li>出售、转让或租赁您的账户</li>
                      <li>使用虚假信息注册账户</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">2.4 账户终止</h3>
                    <p>
                      您可以随时终止您的账户，但需遵守本条款的相关规定。本博客也可能根据本条款终止您的账户。                    </p>
                    <p>
                      账户终止后，您可能无法访问账户及相关内容。我们可能会根据法律要求保留某些信息。                    </p>
                  </div>
                </div>
              )}

              {/* 内容规范 */}
              {activeSection === "content" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">3. 内容规范</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-6 mb-3">3.1 内容发布</h3>
                    <p>
                      您可以在本博客发布原创内容，包括但不限于文章、评论、图片等。您对发布的内容承担全部责任�?                    </p>
                    <p>
                      发布内容时，您声明并保证：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>您拥有内容的全部权利或已获得必要的授权</li>
                      <li>内容不侵犯任何第三方的知识产权</li>
                      <li>内容不违反任何适用的法律法规</li>
                      <li>内容不包含任何有害或非法信息</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">3.2 内容禁止</h3>
                    <p>
                      您不得发布以下内容：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>违反法律法规的内容</li>
                      <li>侵犯他人知识产权的内容</li>
                      <li>涉及色情、暴力、恐怖的内容</li>
                      <li>含有病毒、恶意代码的内容</li>
                      <li>垃圾信息、广告信息</li>
                      <li>仇恨言论、歧视性内容</li>
                      <li>虚假信息、误导性内容</li>
                      <li>其他可能损害他人或公共利益的内容</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">3.3 内容权利</h3>
                    <p>
                      您保留对原创内容的知识产权，但授予本博客在全球范围内使用、修改、展示、分发您的内容的权利，以便提供和改进本服务。                    </p>
                    <p>
                      具体而言，您授予我们：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>存储、托管和备份您的内容</li>
                      <li>在服务中显示和分发您的内容</li>
                      <li>为提供和改进服务而修改您的内容</li>
                      <li>在您删除内容后，在备份中保留内容的副本</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">3.4 内容审核</h3>
                    <p>
                      我们保留但不承担义务审核、监控或编辑用户内容。如果我们发现或被告知任何违反这些条款的内容，我们可能会采取适当的行动。                    </p>
                    <p>
                      用户可以通过举报功能向我们报告违反这些条款的内容。我们将根据我们的政策和适用的法律审查所有举报。                    </p>
                  </div>
                </div>
              )}

              {/* 隐私保护 */}
              {activeSection === "privacy" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">4. 隐私保护</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      我们重视您的隐私保护。关于我们如何收集、使用、存储和保护您的个人信息，请参阅我们的{" "}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        隐私政策
                      </Link>

                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">4.1 信息收集</h3>
                    <p>
                      我们收集您主动提供的信息，如注册信息、发布内容等，以及您使用服务时自动生成的信息，如IP地址、访问日志等。                    </p>
                    <p>
                      我们可能收集以下类型的信息：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>账户信息（用户名、邮箱地址、密码等）</li>
                      <li>个人资料信息（头像、简介等）</li>
                      <li>您发布的内容（文章、评论等）</li>
                      <li>使用信息（访问时间、浏览页面、点击链接等）</li>
                      <li>设备信息（IP地址、浏览器类型、操作系统等）</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">4.2 信息使用</h3>
                    <p>
                      我们使用收集的信息来提供、维护和改进本服务，与您沟通，以及确保平台安全。                    </p>
                    <p>
                      具体使用目的包括：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>提供、维护和改进我们的服务</li>
                      <li>处理您的请求和交易</li>
                      <li>向您发送通知、更新和营销信息（在您同意的情况下）</li>
                      <li>个性化您的体验</li>
                      <li>保护安全和防止欺诈</li>
                      <li>遵守法律义务</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">4.3 信息保护</h3>
                    <p>
                      我们采取合理的安全措施保护您的个人信息，防止未经授权的访问、使用或披露。                    </p>
                    <p>
                      我们的安全措施包括：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>使用加密技术保护数据传输</li>
                      <li>实施访问控制和身份验证</li>
                      <li>定期审查和更新安全措施</li>
                      <li>限制员工对个人信息的访问</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">4.4 信息共享</h3>
                    <p>
                      我们不会出售、交易或转让您的个人信息给第三方，除非我们获得您的同意或法律要求。                    </p>
                    <p>
                      我们可能与服务提供商共享信息，以便他们能够代表我们提供服务，例如：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>云存储服务提供商</li>
                      <li>客户支持服务提供商</li>
                      <li>数据分析服务提供商</li>
                      <li>支付处理服务提供商</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 个性化推荐与数据使用*/}
              {activeSection === "personalization" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">个性化推荐与数据使用</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      为提供更贴合您偏好的内容，我们可能基于您的浏览、互动与设置进行个性化推荐与分析。这包括但不限于对您关注的主题、标签与作者进行偏好建模。                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>个性化仅在您给予同意后启用，您可在“设置”中随时撤回或调整偏好。</li>
                      <li>我们用于个性化的数据范围、保存期限与安全措施受隐私政策约束。</li>
                      <li>当启用AI 分析时，可能使用页面片段或您选中的文本以生成建议与摘要。</li>
                    </ul>
                    <p>
                      撤回同意后，我们不再继续用于个性化的处理，并在合理期限内完成相关数据的清理或匿名化。                    </p>
                  </div>
                </div>
              )}

              {/* 知识产权 */}
              {activeSection === "intellectual" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">5. 知识产权</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-6 mb-3">5.1 博客内容</h3>
                    <p>
                      本博客的所有内容，包括但不限于文字、图片、标识、界面设计等，均受知识产权法律保护，未经授权不得使用。                    </p>
                    <p>
                      我们的知识产权包括但不限于：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>商标、服务标志和标识</li>
                      <li>网站设计和布局</li>
                      <li>软件代码和算法</li>
                      <li>文档、指南和其他书面材料</li>
                      <li>图形、图像和多媒体内容</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">5.2 用户内容</h3>
                    <p>
                      您保留对您发布内容的知识产权，但您授予本博客使用这些内容的权利，具体如第3.3条所述。                    </p>
                    <p>
                      您授予的许可是：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>全球性的</li>
                      <li>非排他性的</li>
                      <li>免版税的</li>
                      <li>可转让和可再许可的</li>
                      <li>在服务存续期间有效的</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">5.3 侵权投诉</h3>
                    <p>
                      如果您认为本博客上的内容侵犯了您的知识产权，请通过提供的联系方式向我们提交书面投诉。                    </p>
                    <p>
                      投诉应包含以下信息：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>您的身份和联系信息</li>
                      <li>被侵权作品的描述</li>
                      <li>涉嫌侵权内容的位置</li>
                      <li>您有充分理由相信使用未经授权的声明</li>
                      <li>投诉信息准确无误的声明</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">5.4 反通知</h3>
                    <p>
                      如果您的内容因涉嫌侵权而被移除，您可以提交反通知要求恢复内容。                    </p>
                    <p>
                      反通知应包含：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>您的身份和联系信息</li>
                      <li>被移除内容的位置</li>
                      <li>您有充分理由相信内容被错误移除的声明</li>
                      <li>您同意接受法院管辖的声明</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 责任限制 */}
              {activeSection === "liability" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">6. 责任限制</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.1 服务可用性</h3>
                    <p>
                      本服务按"现状"提供，不保证服务的连续性、及时性、安全性或无错误。                    </p>
                    <p>
                      我们不保证：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>服务将不间断、及时、安全或无错误</li>
                      <li>服务将满足您的特定需求</li>
                      <li>服务结果将准确或可靠</li>
                      <li>服务中的错误将被纠正</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.2 损害赔偿</h3>
                    <p>
                      在法律允许的最大范围内，本博客不对因使用或无法使用本服务而导致的任何直接、间接、偶然、特殊或后果性损害承担责任。                    </p>
                    <p>
                      我们不承担的责任包括但不限于：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>利润损失或数据丢失</li>
                      <li>业务中断</li>
                      <li>替代产品或服务的获取成本</li>
                      <li>任何其他间接、偶然、特殊或后果性损失</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.3 用户内容</h3>
                    <p>
                      本博客不对用户发布的内容承担责任，您使用这些内容的风险由您自行承担。                    </p>
                    <p>
                      我们不认可、支持或保证用户内容的准确性、完整性或有用性。您对用户内容的依赖完全由您自行承担风险。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.4 第三方链接</h3>
                    <p>
                      本服务可能包含指向第三方网站或资源的链接。我们对这些第三方网站或资源不承担任何责任。                    </p>
                    <p>
                      您承认并同意，我们对这些第三方网站或资源的可用性、内容或准确性不承担任何责任，也不对因使用或依赖这些第三方网站或资源而产生的任何损失或损害承担责任。                    </p>
                  </div>
                </div>
              )}

              {/* 服务终止 */}
              {activeSection === "termination" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">7. 服务终止</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-6 mb-3">7.1 用户终止</h3>
                    <p>
                      您可以随时停止使用本服务，并通过账户设置或联系客服的方式终止您的账户�?                    </p>
                    <p>
                      终止账户后：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>您将无法访问您的账户</li>
                      <li>您的内容可能会被删除</li>
                      <li>某些信息可能会根据法律要求保存</li>
                      <li>您可能无法恢复某些数据或内容</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">7.2 博客终止</h3>
                    <p>
                      本博客可能因以下原因终止您的账户或服务：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>违反本条款</li>
                      <li>长期不活跃</li>
                      <li>法律法规要求</li>
                      <li>服务调整或停止</li>
                      <li>安全或欺诈问题</li>
                      <li>其他合理原因</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">7.3 终止后果</h3>
                    <p>
                      账户终止后，您可能无法访问账户及相关内容。本博客可能根据法律要求保留某些信息。                    </p>
                    <p>
                      账户终止不影响以下权利和义务：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>您授予的内容许可</li>
                      <li>您对本条款的遵守</li>
                      <li>我们的免责声明和责任限制</li>
                      <li>任何在终止前产生的义务</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">7.4 服务暂停</h3>
                    <p>
                      在某些情况下，我们可能暂时暂停您的账户或服务，而不是立即终止：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>调查涉嫌违反条款的行为</li>
                      <li>响应法律要求或政府请求</li>
                      <li>维护服务安全或完整性</li>
                      <li>进行系统维护或升级</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 其他条款 */}
              {activeSection === "miscellaneous" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">8. 其他条款</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.1 争议解决</h3>
                    <p>
                      因本条款引起的任何争议，应首先通过友好协商解决。协商不成的，任何一方可向本博客所在地人民法院提起诉讼。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.2 可分割性</h3>
                    <p>
                      如果本条款的任何部分被认定为无效或不可执行，其余部分仍然有效。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.3 完整协议</h3>
                    <p>
                      本条款构成您与本博客之间关于使用本服务的完整协议，取代之前的所有协议。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.4 不弃权</h3>
                    <p>
                      如果我们不执行本条款的任何权利或规定，不构成对该权利或规定的弃权。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.5 转让</h3>
                    <p>
                      您不得转让本条款下的任何权利或义务。我们可以转让本条款下的权利或义务，无需通知您。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.6 通知</h3>
                    <p>
                      我们可能通过电子邮件、服务内通知或其他方式向您发送通知。您同意我们以这种方式发送通知。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.7 联系我们</h3>
                    <p>
                      如果您对本条款有任何疑问，请通过以下方式联系我们：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>邮箱：contact@blog.com</li>
                      <li>地址：中国上海市浦东新区</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.8 适用法律</h3>
                    <p>
                      本条款受中华人民共和国法律管辖，不考虑法律冲突原则。                    </p>
                    <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                      最后更新日期：2024年1月1日                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
