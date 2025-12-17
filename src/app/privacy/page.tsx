"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const router = useRouter();

  const sections = [
    { id: "overview", title: "概述" },
    { id: "collection", title: "信息收集" },
    { id: "usage", title: "信息使用" },
    { id: "sharing", title: "信息共享" },
    { id: "storage", title: "信息存储" },
    { id: "rights", title: "用户权利" },
    { id: "security", title: "信息安全" },
    { id: "cookies", title: "Cookie政策" },
    { id: "children", title: "儿童隐私" },
    { id: "international", title: "国际数据传输" },
    { id: "personalization", title: "个性化与同意管理" },
    { id: "changes", title: "政策变更" },
    { id: "contact", title: "联系我们" }
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">隐私政策</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            我们重视您的隐私，本政策说明我们如何收集、使用和保护您的个人信息
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            最后更新日期：2024年1月1日
          </p>
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
              {/* 概述 */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">1. 概述</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      本隐私政策旨在说明本博客（以下简�?我们"�?博客"�?服务"）如何收集、使用、存储和保护您的个人信息�?                    </p>
                    <p>
                      使用本博客即表示您同意本隐私政策中描述的做法。如果您不同意本政策，请不要使用我们的服务�?                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">1.1 信息保护原则</h3>
                    <p>
                      我们遵循以下原则处理您的个人信息�?                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>合法、正当、必要原则</strong>：我们仅在合法、正当且必要的范围内收集、使用您的个人信息</li>
                      <li><strong>目的明确原则</strong>：我们收集个人信息时具有明确、合法的目的，不会超出范围使用</li>
                      <li><strong>最少够用原则</strong>：我们只收集实现目的所必需的最少信息</li>
                      <li><strong>公开透明原则</strong>：我们通过本政策向您公开我们的信息处理实践</li>
                      <li><strong>安全保障原则</strong>：我们采取合理的安全措施保护您的个人信息</li>
                      <li><strong>主体参与原则</strong>：我们尊重您对个人信息的控制权</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">1.2 适用范围</h3>
                    <p>
                      本政策适用于我们通过本博客（包括网站、移动应用及相关服务）收集的所有个人信息，包括但不限于�?                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>您访问网站、浏览内容时产生的信息</li>
                      <li>您注册账户、登录时提供的信息</li>
                      <li>您发布文章、评论等内容时提供的信息</li>
                      <li>您参与互动、活动时产生的信息</li>
                      <li>您通过第三方账户登录时共享的信息</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">1.3 定义</h3>
                    <p>
                      在本政策中，以下术语具有以下含义：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>个人信息</strong>：以电子或者其他方式记录的能够单独或者与其他信息结合识别特定自然人身份或者反映特定自然人活动情况的各种信息</li>
                      <li><strong>敏感个人信息</strong>：一旦泄露或者非法使用，容易导致人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括生物识别、宗教信仰、特定身份、医疗健康、金融账户、行踪轨迹等信息</li>
                      <li><strong>处理</strong>：包括个人信息的收集、存储、使用、加工、传输、提供、公开等</li>
                      <li><strong>删除</strong>：在实现日常业务功能所涉及的系统中去除个人信息的行为，使其保持不可被检索、访问的状态</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 信息收集 */}
              {activeSection === "collection" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">2. 信息收集</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-6 mb-3">2.1 您主动提供的信息</h3>
                    <p>
                      当您使用我们的服务时，您可能会向我们提供以下信息�?                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>账户信息</strong>：用户名、邮箱地址、密码、手机号码等注册信息</li>
                      <li><strong>个人资料</strong>：头像、昵称、性别、生日、地区、个人简介、职业等</li>
                      <li><strong>内容信息</strong>：您发布的文章、评论、图片、视频等内容</li>
                      <li><strong>互动信息</strong>：点赞、收藏、分享、关注等互动行为</li>
                      <li><strong>通信信息</strong>：您与我们沟通时提供的信息，包括反馈、投诉、咨询等</li>
                      <li><strong>活动信息</strong>：您参与我们组织的活动时提供的信息</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">2.2 自动收集的信息</h3>
                    <p>
                      当您访问我们的网站时，我们可能会自动收集以下技术信息：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>设备信息</strong>：设备类型、操作系统、设备型号、屏幕分辨率、浏览器类型和版本、语言设置等</li>
                      <li><strong>网络信息</strong>：IP地址、ISP信息、网络运营商、接入方式等</li>
                      <li><strong>使用信息</strong>：访问时间、停留时长、页面浏览记录、点击行为、搜索查询等</li>
                      <li><strong>位置信息</strong>：基于IP地址的大致地理位置信息（非精确定位）</li>
                      <li><strong>标识符</strong>：Cookie、类似技术收集的唯一标识符、设备标识符等</li>
                      <li><strong>日志信息</strong>：服务器日志、错误日志、访问日志等</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">2.3 第三方提供的信息</h3>
                    <p>
                      我们可能从以下第三方服务获取您的信息：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>社交媒体平台</strong>：当您通过社交媒体账户登录时，我们可能获取您在该平台公开的基本信息</li>
                      <li><strong>分析服务提供商</strong>：如Google Analytics等，用于分析网站使用情况</li>
                      <li><strong>广告服务提供商</strong>：用于提供个性化广告内容</li>
                      <li><strong>支付处理器</strong>：当您使用付费服务时，支付处理商可能向我们提供交易相关信息</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">2.4 收集信息的法律依据</h3>
                    <p>
                      我们基于以下法律依据收集您的个人信息：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>同意</strong>：基于您的明确同意收集和使用您的个人信息</li>
                      <li><strong>合同履行</strong>：为履行与您签订的合同（如用户协议）所必需</li>
                      <li><strong>法定义务</strong>：为遵守适用的法律法规所必需</li>
                      <li><strong>合法权益</strong>：为保护我们的合法权益所必需</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 信息使用 */}
              {activeSection === "usage" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">3. 信息使用</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      我们使用收集的信息用于以下目的：
                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">3.1 提供服务</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>创建、管理和维护您的账户</li>
                      <li>提供您请求的内容和服务</li>
                      <li>处理您的发布内容和互动行为</li>
                      <li>提供个性化体验和内容推荐</li>
                      <li>实现您的账户设置和偏好</li>
                      <li>处理您的订单和支付请求</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">3.2 改进服务</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>分析使用情况以优化网站功能和内容布局</li>
                      <li>进行研究和开发新产品功能</li>
                      <li>测试和改进服务质量、性能和稳定性</li>
                      <li>了解用户群体特征和需求</li>
                      <li>评估营销活动效果</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">3.3 沟通与安全</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>向您发送服务通知、更新和维护提醒</li>
                      <li>回应您的询问、反馈和投诉</li>
                      <li>发送您订阅的新闻通讯和营销信息（在获得您同意的情况下）</li>
                      <li>检测和防止欺诈、滥用和安全威胁</li>
                      <li>遵守法律法规要求和执法部门请求</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">3.4 数据分析和人工智能</h3>
                    <p>
                      我们可能使用您的信息进行数据分析和人工智能处理，以：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>改进内容推荐算法</li>
                      <li>识别和过滤不当内容</li>
                      <li>优化用户体验和界面设计</li>
                      <li>预测用户需求和趋势</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">3.5 自动化决策</h3>
                    <p>
                      我们可能使用自动化决策系统（如算法）来：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>个性化内容和推荐</li>
                      <li>检测异常行为和安全风险</li>
                      <li>优化搜索结果排序</li>
                    </ul>
                    <p>
                      这些自动化决策系统可能会对您产生法律效力或类似重大影响。如果您对这些决策有异议，您有权要求人工复核。
  </p>
                  </div>
                </div>
              )}

              {/* 信息共享 */}
              {activeSection === "sharing" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">4. 信息共享</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      除以下情况外，我们不会出售、交易或转让您的个人信息给第三方：                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">4.1 公开信息</h3>
                    <p>
                      您发布的内容（如文章、评论）将对其他用户公开，请谨慎分享个人信息。您可以通过账户设置控制信息的公开范围。
  </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">4.2 服务提供商</h3>
                    <p>
                      我们可能与以下第三方服务提供商共享必要的信息，以提供我们的服务：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>云服务提供商</strong>：如阿里云、腾讯云等，用于托管和数据存储</li>
                      <li><strong>分析服务提供商</strong>：如Google Analytics、百度统计等，用于网站分析</li>
                      <li><strong>支付处理器</strong>：如支付宝、微信支付等，用于处理支付</li>
                      <li><strong>通信服务提供商</strong>：如邮件服务提供商、短信服务商等，用于发送通知</li>
                      <li><strong>内容分发网络</strong>：如CDN服务商，用于加速内容加载</li>
                      <li><strong>客服服务提供商</strong>：用于提供客户支持服务</li>
                    </ul>
                    <p>
                      我们与这些服务提供商签订合同，确保他们按照本政策和适用法律保护您的个人信息。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">4.3 业务转让</h3>
                    <p>
                      在合并、收购或资产转让等交易中，您的个人信息可能作为交易的一部分被转让。我们将提前通知您，并确保您的个人信息在转让后继续受到同等保护。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">4.4 法律要求</h3>
                    <p>
                      我们可能在以下情况下披露您的信息：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>法律法规要求或允许</li>
                      <li>政府机关、司法机关或监管机构的合法请求</li>
                      <li>保护我们的权利、财产或安全</li>
                      <li>防止欺诈、违法行为或保护他人安全</li>
                      <li>执行我们的用户协议和其他政策</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">4.5 匿名化信息</h3>
                    <p>
                      我们可能共享匿名化或聚合化的信息，这些信息无法识别到个人。例如，我们可能分享网站使用统计报告、用户群体分析等。                    </p>
                  </div>
                </div>
              )}

              {/* 信息存储 */}
              {activeSection === "storage" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">5. 信息存储</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-6 mb-3">5.1 存储位置</h3>
                    <p>
                      您的个人信息存储在安全的服务器上，主要位于中国境内。如需跨境传输，我们将确保符合相关法律法规要求，并采取适当的安全保障措施�?                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">5.2 存储期限</h3>
                    <p>
                      我们仅在必要期限内保留您的个人信息：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>账户信息</strong>：在您使用服务期间及之后的一定期限内（通常为账户注销后180天）</li>
                      <li><strong>发布内容</strong>：在您删除内容或账户后的一定期限内（通常为30-90天）</li>
                      <li><strong>日志信息</strong>：通常保留6个月至1年，用于安全分析和故障排除</li>
                      <li><strong>交易记录</strong>：根据税务和会计要求，通常保留5-7年</li>
                      <li><strong>法律要求</strong>：按法律法规要求的期限保存</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">5.3 存储安全</h3>
                    <p>
                      我们采取多种措施确保您的信息安全存储。                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>数据加密存储和传输</li>
                      <li>访问控制和身份验证</li>
                      <li>定期安全审计和漏洞扫描</li>
                      <li>数据备份和灾难恢复计划</li>
                      <li>员工培训和保密协议</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">5.4 数据删除</h3>
                    <p>
                      当信息达到存储期限或不再需要时，我们将安全地删除或匿名化处理这些信息。删除过程将确保信息无法被恢复。                    </p>
                  </div>
                </div>
              )}

              {/* 用户权利 */}
              {activeSection === "rights" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">6. 用户权利</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      根据相关法律法规，您享有以下权利：                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.1 访问权</h3>
                    <p>
                      您有权访问我们持有的关于您的个人信息。您可以通过账户设置查看和管理您的信息。如果您无法通过账户设置访问，您也可以联系我们获取您的个人信息副本。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.2 更正权</h3>
                    <p>
                      您有权更正不准确或不完整的个人信息。您可以通过账户设置或联系我们进行更正。对于某些关键信息（如身份验证信息），我们可能要求您提供额外证明。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.3 删除权</h3>
                    <p>
                      在特定情况下，您有权要求删除您的个人信息，包括：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>我们不再需要这些信息来实现收集目的</li>
                      <li>您撤回了同意</li>
                      <li>您反对处理且没有其他合法利益</li>
                      <li>我们非法处理了您的信息</li>
                      <li>我们必须遵守法律义务</li>
                    </ul>
                    <p>
                      您可以通过删除账户或联系我们行使此权利。请注意，删除信息可能会影响您使用我们的服务。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.4 限制处理权</h3>
                    <p>
                      在特定情况下，您有权限制我们处理您的个人信息，包括：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>您对信息的准确性提出异议</li>
                      <li>处理是非法的，但您不希望删除信息</li>
                      <li>我们不再需要这些信息，但您需要它们用于法律主张</li>
                      <li>您已反对处理，等待核实我们的合法利益是否优先</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.5 数据可携带权</h3>
                    <p>
                      您有权以结构化、常用和机器可读的格式获取您的个人信息，并将其转移给其他控制者。您可以通过账户设置导出您的数据，或联系我们请求提供。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.6 反对权</h3>
                    <p>
                      您有权反对我们基于合法利益处理您的个人信息，包括直接营销。如果您反对，我们将停止处理您的信息，除非我们有令人信服的合法理由。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.7 与自动化决策相关的权利</h3>
                    <p>
                      您有权不受仅基于自动化处理（包括数据分析）的、对您产生法律效力或类似重大影响的决策的约束。您有权要求人工干预、表达您的观点和对决策提出异议。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.8 投诉权</h3>
                    <p>
                      如果您认为我们的数据处理违反了适用法律，您有权向监管机构投诉。有关监管机构的信息，请参见"联系我们"部分。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">6.9 如何行使您的权利</h3>
                    <p>
                      您可以通过以下方式行使您的权利：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>通过账户设置进行自助操作</li>
                      <li>发送电子邮件至 privacy@blog.com</li>
                      <li>通过邮寄地址联系我们</li>
                    </ul>
                    <p>
                      我们将在收到您的请求�?0天内回复。在某些复杂情况下，我们可能需要更多时间，但我们会及时通知您�?                    </p>
                  </div>
                </div>
              )}

              {/* 信息安全 */}
              {activeSection === "security" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">7. 信息安全</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      我们采取多种安全措施保护您的个人信息。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">7.1 技术措施</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>传输安全</strong>：使用SSL/TLS加密技术保护数据传输安全</li>
                      <li><strong>存储安全</strong>：敏感数据采用加密存储，访问密钥安全管理</li>
                      <li><strong>访问控制</strong>：基于角色的访问控制，多因素身份验证</li>
                      <li><strong>网络安全</strong>：防火墙、入侵检测和防御系统</li>
                      <li><strong>安全评估</strong>：定期进行安全漏洞扫描和渗透测试</li>
                      <li><strong>代码安全</strong>：安全编码规范，代码审查和静态分析</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">7.2 管理措施</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>员工培训</strong>：定期进行隐私和安全培训</li>
                      <li><strong>保密协议</strong>：所有接触个人信息的员工签署保密协议</li>
                      <li><strong>最小权限</strong>：遵循最小权限原则，限制员工访问权限</li>
                      <li><strong>访问日志</strong>：记录和监控数据访问日志</li>
                      <li><strong>安全审计</strong>：定期进行内部和外部安全审计</li>
                      <li><strong>事件响应</strong>：建立安全事件响应计划和团队</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">7.3 数据泄露通知</h3>
                    <p>
                      如果发生可能影响您个人信息安全的数据泄露，我们将：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>立即启动应急响应计划</li>
                      <li>评估泄露的影响范围和风险</li>
                      <li>采取必要措施控制泄露</li>
                      <li>在法律要求的时间内通知您</li>
                      <li>向监管机构报告（如适用）</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">7.4 第三方安全管理</h3>
                    <p>
                      我们对与我们共享个人信息的第三方进行严格的安全评估和监督，确保他们采取适当的安全措施保护您的信息。                    </p>
                  </div>
                </div>
              )}

              {/* Cookie政策 */}
              {activeSection === "cookies" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">8. Cookie政策</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.1 什么是Cookie</h3>
                    <p>
                      Cookie是存储在您设备上的小型文本文件，由网站发送并存储在您的浏览器中。它们用于识别您的浏览器并记住有关您访问的信息。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.2 我们使用的Cookie类型</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>必要Cookie</strong>：这些Cookie是网站正常运行所必需的，如保持登录状态、管理购物车等</li>
                      <li><strong>性能Cookie</strong>：这些Cookie收集有关您如何使用网站的信息，帮助我们改进网站性能</li>
                      <li><strong>功能Cookie</strong>：这些Cookie记住您的选择和偏好，提供个性化体验</li>
                      <li><strong>营销Cookie</strong>：这些Cookie用于向您展示相关广告和内容</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.3 我们如何使用Cookie</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>保持您的登录状态</li>
                      <li>记住您的偏好和设置</li>
                      <li>分析网站使用情况</li>
                      <li>提供个性化内容和推荐</li>
                      <li>展示相关广告</li>
                      <li>防止欺诈和增强安全</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.4 第三方Cookie</h3>
                    <p>
                      我们的服务可能包含第三方服务（如分析服务、广告网络、社交媒体插件）设置的Cookie。这些第三方有自己的隐私政策，我们建议您查看这些政策以了解他们如何使用Cookie。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.5 管理Cookie</h3>
                    <p>
                      您可以通过浏览器设置管理Cookie。                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>接受或拒绝所有Cookie</li>
                      <li>删除已存储的Cookie</li>
                      <li>阻止特定网站设置Cookie</li>
                      <li>在Cookie过期前删除它们</li>
                    </ul>
                    <p>
                      请注意，禁用或删除某些Cookie可能会影响您使用我们服务的体验。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">8.6 Cookie同意</h3>
                    <p>
                      当您首次访问我们的网站时，我们将显示Cookie横幅，请求您同意使用非必要Cookie。您可以随时通过Cookie设置更改您的偏好。                    </p>
                  </div>
                </div>
              )}

              {/* 儿童隐私 */}
              {activeSection === "children" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">9. 儿童隐私</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      我们的服务不面向13岁以下的儿童。我们不会故意收�?3岁以下儿童的个人信息�?                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">9.1 年龄验证</h3>
                    <p>
                      我们不会收集年龄信息，但如果我们发现收集�?3岁以下儿童的个人信息，我们将采取步骤删除这些信息�?                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">9.2 家长控制</h3>
                    <p>
                      如果您是家长或监护人，并且发现您的孩子向我们提供了个人信息，请立即联系我们，以便我们删除这些信息�?                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">9.3 教育资源</h3>
                    <p>
                      我们提供教育资源，帮助家长和监护人了解儿童在线隐私保护的重要性，以及如何保护儿童的个人信息�?                    </p>
                  </div>
                </div>
              )}

              {/* 国际数据传输 */}
              {activeSection === "international" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">10. 国际数据传输</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      您的个人信息主要在中国境内存储和处理。在以下情况下，我们可能将您的个人信息传输到境外：                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">10.1 传输情形</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>您在境外访问我们的服务</li>
                      <li>我们使用境外服务提供商</li>
                      <li>境外用户与您互动</li>
                      <li>跨境业务需求</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">10.2 传输保障</h3>
                    <p>
                      当我们需要跨境传输您的个人信息时，我们将确保：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>获得您的明确同意（如法律要求）</li>
                      <li>签署适当的数据传输协议</li>
                      <li>确保接收方提供充分的数据保护</li>
                      <li>符合适用的法律法规要求</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">10.3 数据本地化</h3>
                    <p>
                      对于某些敏感个人信息，我们可能采取数据本地化措施，确保这些信息仅在中国境内存储和处理。                    </p>
                  </div>
                </div>
              )}

              {/* 个性化与同意管理*/}
              {activeSection === "personalization" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">个性化与同意管理</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      您可在“设置”中开启或关闭个性化推荐，并管理用于推荐的偏好、通知与数据使用同意。我们仅在您明确同意后进行相关处理。
          </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>可随时撤回同意，不影响撤回前基于同意的合法处理。</li>
                      <li>可访问与导出相关偏好数据，并请求更正或删除。</li>
                      <li>AI 分析可能使用页面片段与选中文本，以生成摘要与建议。</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 政策变更 */}
              {activeSection === "changes" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">11. 政策变更</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      我们可能会不时更新本隐私政策。当我们进行重大变更时，我们将通过以下方式通知您：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>在网站上发布通知</li>
                      <li>通过电子邮件发送通知</li>
                      <li>在您下次登录时显示通知</li>
                      <li>通过应用内通知</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">11.1 重大变更</h3>
                    <p>
                      以下情况被视为重大变更：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>改变我们收集和使用个人信息的方式</li>
                      <li>改变我们共享个人信息的方式</li>
                      <li>改变您的权利或选择</li>
                      <li>改变我们的联系信息</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">11.2 生效日期</h3>
                    <p>
                      更新后的政策将在发布后生效。如果您在政策变更后继续使用我们的服务，即表示您接受更新后的政策。                    </p>
                    <p>
                      我们建议您定期查看本政策，以了解我们如何保护您的信息。本政策最后更新日期为页面底部所示。                    </p>
                  </div>
                </div>
              )}

              {/* 联系我们 */}
              {activeSection === "contact" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">12. 联系我们</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p>
                      如果您对本隐私政策有任何疑问或担忧，或者想要行使您的权利，请通过以下方式联系我们：                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>邮箱</strong>：privacy@blog.com</li>
                      <li><strong>地址</strong>：中国上海市浦东新区张江高科技园区</li>
                      <li><strong>电话</strong>：+86 21 12345678</li>
                      <li><strong>在线表单</strong>：通过网站"联系我们"页面提交</li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-3">12.1 数据保护官</h3>
                    <p>
                      我们已指定数据保护官负责隐私保护事宜。如果您有关于隐私保护的特定问题，您可以通过上述联系方式联系我们的数据保护官。                    </p>
                    <h3 className="text-lg font-semibold mt-6 mb-3">12.2 监管机构</h3>
                    <p>
                      如果您认为我们的数据处理违反了适用法律，您有权向以下监管机构投诉：
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>国家网信部门</strong>：www.cac.gov.cn</li>
                      <li><strong>工业和信息化部门</strong>：www.miit.gov.cn</li>
                      <li><strong>公安部门</strong>：www.mps.gov.cn</li>
                      <li><strong>市场监督管理部门</strong>：www.samr.gov.cn</li>
                    </ul>
                    <p>
                      我们将尽快回复您的询问，通常�?0天内。对于复杂的请求，我们可能需要更多时间，但我们会及时通知您�?                    </p>
                    <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                      最后更新日期：2024年1月1日
                    </p>
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
