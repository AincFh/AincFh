import { SettingGroup, SettingRow } from './SettingGroup';
import { Switch } from '@/admin/components/ui/Switch';
import { Globe, Upload } from 'lucide-react';

interface GeneralSettingsProps {
    settings: any;
    updateSetting: (section: string, key: string, value: any) => void;
}

export function GeneralSettings({ settings, updateSetting }: GeneralSettingsProps) {
    return (
        <div className="space-y-6">
            <SettingGroup title="网站信息">
                <SettingRow
                    label="网站标题"
                    value={settings?.siteTitle || '我的博客'}
                    showChevron
                />
                <SettingRow
                    label="网站描述"
                    description="显示在搜索引擎结果中"
                    showChevron
                />
                <SettingRow
                    label="关键词"
                    description="使用逗号分隔"
                    showChevron
                />
            </SettingGroup>

            <SettingGroup title="品牌标识">
                <SettingRow label="网站 Logo" showChevron />
                <SettingRow label="Favicon" showChevron />
            </SettingGroup>

            <SettingGroup title="区域设置">
                <SettingRow label="语言" value="简体中文" showChevron />
                <SettingRow label="时区" value="Asia/Shanghai" showChevron />
                <SettingRow label="日期格式" value="YYYY-MM-DD" showChevron />
                <SettingRow label="时间格式" value="24 小时制" showChevron />
            </SettingGroup>
        </div>
    );
}
