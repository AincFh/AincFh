import { SettingGroup, SettingRow } from './SettingGroup';
import { Switch } from '@/admin/components/ui/Switch';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ProfileSettingsProps {
    settings: any;
    updateSetting: (section: string, key: string, value: any) => void;
}

export function ProfileSettings({ settings, updateSetting }: ProfileSettingsProps) {
    return (
        <div className="space-y-6">
            <div className="text-center py-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                    A
                </div>
                <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                    更换头像
                </button>
            </div>

            <SettingGroup title="基本信息">
                <SettingRow label="用户名" value="admin" showChevron />
                <SettingRow label="昵称" value="管理员" showChevron />
                <SettingRow label="邮箱" value="admin@example.com" showChevron />
                <SettingRow label="角色" value="超级管理员" />
            </SettingGroup>

            <SettingGroup title="安全">
                <SettingRow label="修改密码" showChevron />
                <SettingRow
                    label="双因素认证"
                    description="为您的账户增加额外的安全保护"
                >
                    <Switch
                        checked={settings?.twoFactorEnabled || false}
                        onChange={(val) => updateSetting('profile', 'twoFactorEnabled', val)}
                    />
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
