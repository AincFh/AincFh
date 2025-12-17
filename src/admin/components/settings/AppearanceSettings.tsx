import { SettingGroup, SettingRow } from './SettingGroup';
import { Switch } from '@/admin/components/ui/Switch';
import { Sun, Moon, Monitor } from 'lucide-react';

interface AppearanceSettingsProps {
    settings: any;
    updateSetting: (section: string, key: string, value: any) => void;
    theme: string;
    setTheme: (theme: 'light' | 'dark') => void;
}

export function AppearanceSettings({ settings, updateSetting, theme, setTheme }: AppearanceSettingsProps) {
    return (
        <div className="space-y-6">
            <SettingGroup title="主题">
                <div className="p-4 grid grid-cols-3 gap-3">
                    <button
                        onClick={() => {
                            setTheme('light');
                            updateSetting('appearance', 'theme', 'light');
                        }}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }`}
                    >
                        <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-blue-500' : 'text-neutral-400'}`} />
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">浅色</span>
                    </button>

                    <button
                        onClick={() => {
                            setTheme('dark');
                            updateSetting('appearance', 'theme', 'dark');
                        }}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }`}
                    >
                        <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-500' : 'text-neutral-400'}`} />
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">深色</span>
                    </button>

                    <button
                        onClick={() => updateSetting('appearance', 'theme', 'auto')}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${settings?.theme === 'auto'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }`}
                    >
                        <Monitor className={`w-6 h-6 ${settings?.theme === 'auto' ? 'text-blue-500' : 'text-neutral-400'}`} />
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">自动</span>
                    </button>
                </div>
            </SettingGroup>

            <SettingGroup title="布局">
                <SettingRow label="首页布局" value="网格" showChevron />
                <SettingRow label="文章卡片样式" value="现代" showChevron />
                <SettingRow label="导航栏样式" value="固定顶部" showChevron />
            </SettingGroup>

            <SettingGroup title="动画效果">
                <SettingRow
                    label="页面过渡动画"
                    description="切换页面时显示平滑过渡"
                >
                    <Switch
                        checked={settings?.pageTransitions !== false}
                        onChange={(val) => updateSetting('appearance', 'pageTransitions', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="滚动动画"
                    description="滚动时元素淡入效果"
                >
                    <Switch
                        checked={settings?.scrollAnimations !== false}
                        onChange={(val) => updateSetting('appearance', 'scrollAnimations', val)}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="颜色">
                <SettingRow label="主题色" value="#007AFF" showChevron />
                <SettingRow label="辅助色" value="#8E8E93" showChevron />
            </SettingGroup>
        </div>
    );
}
