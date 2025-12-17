import { SettingGroup, SettingRow } from './SettingGroup';
import { Switch } from '@/admin/components/ui/Switch';

interface NotificationSettingsProps {
    settings: any;
    updateSetting: (section: string, key: string, value: any) => void;
}

export function NotificationSettings({ settings, updateSetting }: NotificationSettingsProps) {
    return (
        <div className="space-y-6">
            <SettingGroup title="邮件服务">
                <SettingRow
                    label="启用邮件通知"
                >
                    <Switch
                        checked={settings?.emailEnabled !== false}
                        onChange={(val) => updateSetting('notifications', 'emailEnabled', val)}
                    />
                </SettingRow>
                <SettingRow label="SMTP 服务器" value={settings?.smtpServer || '未配置'} showChevron />
                <SettingRow label="SMTP 端口" value={settings?.smtpPort || 587} showChevron />
                <SettingRow label="发件人邮箱" value={settings?.fromEmail || '未配置'} showChevron />
            </SettingGroup>

            <SettingGroup title="通知事件">
                <SettingRow
                    label="新评论通知"
                    description="有新评论时发送邮件"
                >
                    <Switch
                        checked={settings?.newCommentNotification || false}
                        onChange={(val) => updateSetting('notifications', 'newCommentNotification', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="新用户注册通知"
                >
                    <Switch
                        checked={settings?.newUserNotification || false}
                        onChange={(val) => updateSetting('notifications', 'newUserNotification', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="系统更新通知"
                >
                    <Switch
                        checked={settings?.systemUpdatesNotification || false}
                        onChange={(val) => updateSetting('notifications', 'systemUpdatesNotification', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="安全警报"
                >
                    <Switch
                        checked={settings?.securityAlertsNotification !== false}
                        onChange={(val) => updateSetting('notifications', 'securityAlertsNotification', val)}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="推送设置">
                <SettingRow
                    label="浏览器推送通知"
                    description="在桌面显示通知"
                >
                    <Switch
                        checked={settings?.browserNotifications || false}
                        onChange={(val) => updateSetting('notifications', 'browserNotifications', val)}
                    />
                </SettingRow>
                <SettingRow label="通知位置" value="右上角" showChevron />
            </SettingGroup>

            <SettingGroup title="第三方集成">
                <SettingRow label="Slack Webhook" showChevron />
                <SettingRow label="Telegram Bot" showChevron />
                <SettingRow label="Discord Webhook" showChevron />
            </SettingGroup>
        </div>
    );
}
