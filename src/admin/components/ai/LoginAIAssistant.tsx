"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, HelpCircle, Lock, Key, MessageSquare, Users, Image, FolderTree, Tag, Settings } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

// 登录助手词汇库条目接口
interface LoginVocabularyEntry {
    keywords: string[]; // 相关关键词列表
    description: string; // 详细描述/教程
    steps?: string[]; // 操作步骤
    relatedTopics?: string[]; // 相关主题
}

// 登录助手全面词汇库
const loginVocabularyLibrary: LoginVocabularyEntry[] = [
    // 通用问候
    {
        keywords: ['你好', 'hello', 'hi', '您好', '嗨'],
        description: '您好！我是登录助手。遇到登录问题了吗？我可以帮您解决忘记密码、账号锁定、登录失败等各种登录相关问题。',
        relatedTopics: ['帮助', '登录', '密码', '锁定']
    },
    {
        keywords: ['帮助', 'help', '求助', '需要帮助', '怎么用'],
        description: '我是登录助手，专门为您解决登录相关问题。您可以问我关于忘记密码、账号锁定、登录失败、注册流程等问题。',
        relatedTopics: ['登录', '密码', '锁定', '注册']
    },
    {
        keywords: ['再见', 'bye', 'goodbye', '拜拜', '结束'],
        description: '再见！如果您还有其他登录问题，随时可以回来找我。祝您登录顺利！',
        relatedTopics: ['感谢', '帮助']
    },
    {
        keywords: ['感谢', '谢谢', 'thanks', 'thank you'],
        description: '不客气！能够帮助到您我很开心。如果您还有其他登录问题，随时可以问我。',
        relatedTopics: ['再见', '帮助']
    },

    // 密码相关
    {
        keywords: ['密码', 'password', '忘记密码', '重置密码', '密码找回'],
        description: '如果您忘记了密码，可以通过以下方式重置：',
        steps: [
            '1. 点击登录页面下方的"忘记密码"链接',
            '2. 输入您的注册邮箱',
            '3. 系统会向您的邮箱发送一封密码重置邮件',
            '4. 点击邮件中的重置链接',
            '5. 设置新的密码',
            '6. 使用新密码登录系统'
        ],
        relatedTopics: ['登录', '邮箱', '重置']
    },
    {
        keywords: ['重置', 'reset', '密码重置', '重置密码'],
        description: '密码重置流程如下：',
        steps: [
            '1. 访问登录页面',
            '2. 点击"忘记密码"链接',
            '3. 输入注册邮箱',
            '4. 查收密码重置邮件',
            '5. 点击邮件中的链接设置新密码'
        ],
        relatedTopics: ['密码', '忘记密码', '邮箱']
    },
    {
        keywords: ['邮箱', 'email', '注册邮箱', '绑定邮箱'],
        description: '注册邮箱是您登录系统的重要凭证，用于接收密码重置邮件和系统通知。如果您忘记了注册邮箱，请联系系统管理员。',
        relatedTopics: ['密码', '重置', '管理员']
    },

    // 账号锁定相关
    {
        keywords: ['锁定', 'lock', '账号锁定', '被锁定', '登录锁定'],
        description: '为了保障账号安全，系统会在连续登录失败5次后自动锁定账号15分钟。',
        steps: [
            '1. 请耐心等待15分钟后再尝试登录',
            '2. 如果您忘记了密码，可以在等待期间通过"忘记密码"功能重置密码',
            '3. 15分钟后使用正确的密码或新密码登录',
            '4. 如果问题仍然存在，请联系系统管理员'
        ],
        relatedTopics: ['登录失败', '密码', '管理员']
    },
    {
        keywords: ['解锁', 'unlock', '账号解锁', '解除锁定'],
        description: '账号锁定后，系统会自动在15分钟后解锁。如果您需要立即解锁，可以联系系统管理员协助处理。',
        relatedTopics: ['锁定', '管理员', '登录']
    },

    // 登录失败相关
    {
        keywords: ['失败', 'fail', '登录失败', '无法登录', '登录不了'],
        description: '登录失败可能有多种原因，以下是常见的解决方法：',
        steps: [
            '1. 检查您的邮箱地址是否输入正确',
            '2. 检查密码是否区分大小写',
            '3. 确认您的账号是否被锁定（连续失败5次会锁定15分钟）',
            '4. 检查网络连接是否正常',
            '5. 清除浏览器缓存后重试',
            '6. 如果问题仍然存在，请联系系统管理员'
        ],
        relatedTopics: ['密码', '锁定', '网络', '管理员']
    },
    {
        keywords: ['错误', 'error', '登录错误', '系统错误', '报错'],
        description: '如果您遇到登录错误，请尝试以下解决方法：',
        steps: [
            '1. 检查您的邮箱和密码是否正确',
            '2. 刷新页面后重试',
            '3. 清除浏览器缓存和Cookie',
            '4. 尝试使用其他浏览器登录',
            '5. 检查网络连接',
            '6. 如果问题持续存在，请联系系统管理员并提供错误信息截图'
        ],
        relatedTopics: ['失败', '网络', '浏览器', '管理员']
    },
    {
        keywords: ['网络', 'network', '网络问题', '连接失败', '无法连接'],
        description: '网络问题可能导致登录失败或响应缓慢。请尝试以下解决方法：',
        steps: [
            '1. 检查您的网络连接是否正常',
            '2. 尝试刷新页面',
            '3. 检查防火墙或安全软件是否阻止了连接',
            '4. 尝试使用其他网络连接',
            '5. 如果问题仍然存在，请联系您的网络管理员'
        ],
        relatedTopics: ['失败', '慢', '连接']
    },
    {
        keywords: ['慢', 'slow', '登录慢', '响应慢', '加载慢'],
        description: '登录响应慢可能是由多种原因引起的：',
        steps: [
            '1. 检查您的网络连接速度',
            '2. 关闭浏览器中不必要的标签页和扩展程序',
            '3. 清除浏览器缓存和Cookie',
            '4. 尝试使用其他浏览器',
            '5. 避开网络高峰期登录',
            '6. 如果问题持续存在，请联系系统管理员'
        ],
        relatedTopics: ['网络', '浏览器', '失败']
    },

    // 注册相关
    {
        keywords: ['注册', 'register', 'signup', '新用户', '创建账号'],
        description: '目前后台管理系统采用内部邀请注册机制，不支持公开注册。',
        steps: [
            '1. 如果您需要账号，请联系系统管理员',
            '2. 管理员会为您创建账号并发送邀请邮件',
            '3. 您可以使用邀请邮件中的信息登录系统',
            '4. 首次登录后请及时修改密码'
        ],
        relatedTopics: ['管理员', '邀请', '登录']
    },
    {
        keywords: ['邀请', 'invite', '邀请码', '邀请链接', '注册邀请'],
        description: '后台管理系统采用邀请制注册，只有收到邀请的用户才能注册账号。',
        steps: [
            '1. 联系系统管理员获取邀请',
            '2. 管理员会发送邀请邮件到您的邮箱',
            '3. 点击邮件中的邀请链接完成注册',
            '4. 设置密码并登录系统'
        ],
        relatedTopics: ['注册', '管理员', '邮箱']
    },

    // 账号相关
    {
        keywords: ['账号', 'account', '用户名', 'user', '我的账号'],
        description: '您的账号是您登录系统的唯一凭证，由系统管理员创建。如果您忘记了账号信息，请联系系统管理员。',
        relatedTopics: ['登录', '管理员', '密码']
    },
    {
        keywords: ['管理员', 'admin', '联系管理员', '系统管理员'],
        description: '如果您遇到无法自行解决的登录问题，可以联系系统管理员寻求帮助。管理员可以为您重置密码、解锁账号、创建新账号等。',
        relatedTopics: ['密码', '锁定', '注册']
    },

    // 浏览器相关
    {
        keywords: ['浏览器', 'browser', 'Chrome', 'Firefox', 'Safari', 'Edge'],
        description: '系统支持主流浏览器，建议使用最新版本的Chrome、Firefox、Safari或Edge浏览器以获得最佳体验。',
        steps: [
            '1. 确保您的浏览器是最新版本',
            '2. 清除浏览器缓存和Cookie',
            '3. 禁用不必要的浏览器扩展',
            '4. 尝试使用无痕模式登录',
            '5. 如果问题仍然存在，尝试使用其他浏览器'
        ],
        relatedTopics: ['失败', '慢', '网络']
    },
    {
        keywords: ['缓存', 'cookie', '清除缓存', '清除cookie'],
        description: '浏览器缓存和Cookie可能会导致登录问题，建议定期清除：',
        steps: [
            '1. 打开浏览器设置',
            '2. 找到隐私和安全设置',
            '3. 选择清除浏览数据',
            '4. 勾选"缓存的图片和文件"和"Cookie及其他网站数据"',
            '5. 选择时间范围为"所有时间"',
            '6. 点击"清除数据"',
            '7. 重新打开浏览器并尝试登录'
        ],
        relatedTopics: ['浏览器', '失败', '登录']
    }
];

// 智能关键词匹配函数
const matchKeywords = (query: string): LoginVocabularyEntry | null => {
    const lowerQuery = query.toLowerCase();
    let bestMatch: LoginVocabularyEntry | null = null;
    let highestScore = 0;

    // 遍历词汇库，计算匹配分数
    for (const entry of loginVocabularyLibrary) {
        let score = 0;

        // 检查每个关键词的匹配情况
        for (const keyword of entry.keywords) {
            const lowerKeyword = keyword.toLowerCase();
            if (lowerQuery === lowerKeyword) {
                // 完全匹配分数最高
                score += 15;
            } else if (lowerQuery.includes(lowerKeyword)) {
                // 包含匹配分数次之
                score += 8;

                // 关键词在开头或结尾，分数更高
                if (lowerQuery.startsWith(lowerKeyword) || lowerQuery.endsWith(lowerKeyword)) {
                    score += 3;
                }
            }
        }

        // 检查相关主题匹配
        if (entry.relatedTopics) {
            for (const topic of entry.relatedTopics) {
                if (lowerQuery.includes(topic.toLowerCase())) {
                    score += 3;
                }
            }
        }

        // 更新最佳匹配
        if (score > highestScore) {
            highestScore = score;
            bestMatch = entry;
        }
    }

    return bestMatch;
};

export default function LoginAIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: '您好！我是登录助手。如果您遇到登录困难或忘记密码，我可以为您提供帮助。',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        let responseText = '';

        // 使用智能词汇库匹配系统
        const matchedEntry = matchKeywords(text);

        if (matchedEntry) {
            // 构建完整回复，包含描述和步骤
            responseText = matchedEntry.description;
            if (matchedEntry.steps && matchedEntry.steps.length > 0) {
                responseText += '\n\n操作步骤：';
                for (const step of matchedEntry.steps) {
                    responseText += `\n${step}`;
                }
            }
            if (matchedEntry.relatedTopics && matchedEntry.relatedTopics.length > 0) {
                responseText += '\n\n您还可以了解：';
                responseText += matchedEntry.relatedTopics.join('、');
            }
        } else {
            // 无匹配结果时的默认回复
            responseText = '抱歉，我暂时无法回答这个问题。您可以尝试问我关于以下登录相关的问题：\n\n- 忘记密码\n- 账号锁定\n- 登录失败\n- 注册流程\n- 浏览器兼容性\n\n或者您可以尝试使用更简单的关键词提问。';
        }

        // 直接返回AI响应
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: responseText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    };

    const quickActions = [
        { icon: Key, label: '忘记密码', action: '我忘记密码了' },
        { icon: Lock, label: '账号锁定', action: '账号被锁定了怎么办' },
        { icon: HelpCircle, label: '无法登录', action: '为什么登录失败' },
    ];

    return (
        <>
            {/* Floating Trigger Button - Isolated Style */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center z-50 group hover:bg-white/20 transition-all"
                    >
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900" />

                        {/* Tooltip */}
                        <div className="absolute right-full mr-4 px-3 py-1.5 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md">
                            登录帮助
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-8 right-8 w-[350px] h-[500px] bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-white">登录助手</h3>
                                    <p className="text-xs text-neutral-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-neutral-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai'
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                                        : 'bg-neutral-800'
                                        }`}>
                                        {msg.role === 'ai' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-neutral-400" />}
                                    </div>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-neutral-800 border border-white/10 text-neutral-200 rounded-tl-none'
                                        }`}>
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-neutral-800 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length < 3 && (
                            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSend(action.action)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-neutral-300 hover:bg-white/10 hover:border-white/20 transition-colors whitespace-nowrap"
                                    >
                                        <action.icon className="w-3 h-3" />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-neutral-900 border-t border-white/10">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="遇到什么问题？"
                                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-neutral-800 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm transition-all text-white placeholder-neutral-500 outline-none"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
