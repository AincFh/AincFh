import { SettingGroup, SettingRow } from './SettingGroup';
import { Switch } from '@/admin/components/ui/Switch';
import { AlertTriangle, Database, RefreshCw, Trash2 } from 'lucide-react';

interface SystemSettingsProps {
    settings: any;
    updateSetting: (section: string, key: string, value: any) => void;
}

export function SystemSettings({ settings, updateSetting }: SystemSettingsProps) {
    return (
        <div className="space-y-6">
            <SettingGroup title="系统状态">
                <SettingRow
                    label="维护模式"
                    description="开启后仅管理员可访问"
                >
                    <Switch
                        checked={settings?.maintenanceMode || false}
                        onChange={(val) => updateSetting('system', 'maintenanceMode', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="调试模式"
                    description="显示详细错误信息"
                >
                    <Switch
                        checked={settings?.debugMode || false}
                        onChange={(val) => updateSetting('system', 'debugMode', val)}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="数据管理">
                <SettingRow label="导出数据" showChevron />
                <SettingRow label="导入数据" showChevron />
                <SettingRow label="数据库备份" showChevron />
            </SettingGroup>

            <SettingGroup title="系统维护">
                <SettingRow label="清除缓存" showChevron />
                <SettingRow label="重建索引" showChevron />
                <SettingRow label="优化数据库" showChevron />
            </SettingGroup>

            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-900/20">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                            危险操作
                        </h4>
                        <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                            以下操作可能导致数据丢失，请谨慎操作
                        </p>
                        <button className="text-sm text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300">
                            重置所有设置
                        </button>
                    </div>
                </div>
            </div>

            <SettingGroup title="系统信息">
                <SettingRow label="系统版本" value={settings?.version || '1.0.0'} />
                <SettingRow label="数据库版本" value="SQLite 3.x" />
                <SettingRow label="Node.js 版本" value="20.x" />
            </SettingGroup>
        </div>
    );
}
