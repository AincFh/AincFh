import { SettingGroup, SettingRow } from './SettingGroup';
import { Switch } from '@/admin/components/ui/Switch';

interface AISettingsProps {
    settings: any;
    updateSetting: (section: string, key: string, value: any) => void;
}

export function AISettings({ settings, updateSetting }: AISettingsProps) {
    return (
        <div className="space-y-6">
            <SettingGroup title="AI 模型">
                <SettingRow label="提供商" value={getProviderName(settings?.provider)} showChevron />
                <SettingRow label="模型" value={settings?.model || 'gpt-4o-mini'} showChevron />
                <SettingRow label="API Key" value="••••••••" showChevron />
            </SettingGroup>

            <SettingGroup title="生成参数">
                <SettingRow label="温度 (Temperature)" value={settings?.temperature || 0.7} showChevron />
                <SettingRow label="最大 Token 数" value={settings?.maxTokens || 500} showChevron />
            </SettingGroup>

            <SettingGroup title="功能开关">
                <SettingRow
                    label="启用 AI 写作助手"
                    description="在编辑器中显示 AI 助手"
                >
                    <Switch
                        checked={settings?.writingAssistant !== false}
                        onChange={(val) => updateSetting('ai', 'writingAssistant', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="自动生成摘要"
                    description="发布文章时自动生成摘要"
                >
                    <Switch
                        checked={settings?.autoSummary || false}
                        onChange={(val) => updateSetting('ai', 'autoSummary', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="智能标签推荐"
                    description="根据内容推荐标签"
                >
                    <Switch
                        checked={settings?.smartTags || false}
                        onChange={(val) => updateSetting('ai', 'smartTags', val)}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="提示词模板">
                <SettingRow label="文章续写模板" showChevron />
                <SettingRow label="摘要生成模板" showChevron />
                <SettingRow label="标题优化模板" showChevron />
            </SettingGroup>
        </div>
    );
}

function getProviderName(provider: string) {
    const names: Record<string, string> = {
        'local': '本地模型 (Ollama)',
        'openai': 'OpenAI',
        'anthropic': 'Anthropic (Claude)',
        'google': 'Google (Gemini)',
    };
    return names[provider] || '本地模型';
}
