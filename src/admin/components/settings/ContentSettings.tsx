import { SettingGroup, SettingRow } from './SettingGroup';
import { Switch } from '@/admin/components/ui/Switch';

interface ContentSettingsProps {
    settings: any;
    updateSetting: (section: string, key: string, value: any) => void;
}

export function ContentSettings({ settings, updateSetting }: ContentSettingsProps) {
    return (
        <div className="space-y-6">
            <SettingGroup title="文章设置">
                <SettingRow label="每页文章数" value={settings?.postsPerPage || 10} showChevron />
                <SettingRow label="默认分类" value="未分类" showChevron />
                <SettingRow label="默认状态" value="草稿" showChevron />
                <SettingRow
                    label="自动保存"
                    description="编辑时每 60 秒自动保存草稿"
                >
                    <Switch
                        checked={settings?.autoSave !== false}
                        onChange={(val) => updateSetting('content', 'autoSave', val)}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="评论设置">
                <SettingRow
                    label="允许评论"
                    description="访客可以对文章发表评论"
                >
                    <Switch
                        checked={settings?.commentsEnabled !== false}
                        onChange={(val) => updateSetting('content', 'commentsEnabled', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="评论审核"
                    description="新评论需要人工审核后才能显示"
                >
                    <Switch
                        checked={settings?.commentModeration || false}
                        onChange={(val) => updateSetting('content', 'commentModeration', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="垃圾评论防护"
                    description="自动过滤垃圾评论"
                >
                    <Switch
                        checked={settings?.spamProtection !== false}
                        onChange={(val) => updateSetting('content', 'spamProtection', val)}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="媒体设置">
                <SettingRow label="图片压缩质量" value="80%" showChevron />
                <SettingRow label="最大上传大小" value="10 MB" showChevron />
                <SettingRow label="允许的文件类型" showChevron />
            </SettingGroup>
        </div>
    );
}
