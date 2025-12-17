import { SettingGroup, SettingRow } from './SettingGroup';
import { Switch } from '@/admin/components/ui/Switch';

interface SecuritySettingsProps {
    settings: any;
    updateSetting: (section: string, key: string, value: any) => void;
}

export function SecuritySettings({ settings, updateSetting }: SecuritySettingsProps) {
    return (
        <div className="space-y-6">
            <SettingGroup title="访问控制">
                <SettingRow
                    label="开放注册"
                    description="允许访客注册新账户"
                >
                    <Switch
                        checked={settings?.allowRegistration !== false}
                        onChange={(val) => updateSetting('security', 'allowRegistration', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="验证码验证"
                    description="注册和登录时需要验证码"
                >
                    <Switch
                        checked={settings?.captchaEnabled || false}
                        onChange={(val) => updateSetting('security', 'captchaEnabled', val)}
                    />
                </SettingRow>
                <SettingRow label="登录失败限制" value="5 次" showChevron />
            </SettingGroup>

            <SettingGroup title="密码策略">
                <SettingRow label="密码复杂度要求" value="中等" showChevron />
                <SettingRow label="密码过期时间" value="90 天" showChevron />
                <SettingRow
                    label="强制双因素认证"
                    description="要求所有管理员启用 2FA"
                >
                    <Switch
                        checked={settings?.twoFactorAuth || false}
                        onChange={(val) => updateSetting('security', 'twoFactorAuth', val)}
                    />
                </SettingRow>
            </SettingGroup>

            <SettingGroup title="内容安全">
                <SettingRow
                    label="评论审核"
                    description="新评论需要审核后显示"
                >
                    <Switch
                        checked={settings?.commentModeration || false}
                        onChange={(val) => updateSetting('security', 'commentModeration', val)}
                    />
                </SettingRow>
                <SettingRow
                    label="垃圾评论防护"
                >
                    <Switch
                        checked={settings?.spamProtection || false}
                        onChange={(val) => updateSetting('security', 'spamProtection', val)}
                    />
                </SettingRow>
                <SettingRow label="敏感词过滤" showChevron />
            </SettingGroup>

            <SettingGroup title="隐私与合规">
                <SettingRow
                    label="显示 Cookie 同意提示"
                    description="符合 GDPR 要求"
                >
                    <Switch
                        checked={settings?.cookieConsent || false}
                        onChange={(val) => updateSetting('security', 'cookieConsent', val)}
                    />
                </SettingRow>
                <SettingRow label="隐私政策页面" showChevron />
                <SettingRow label="服务条款页面" showChevron />
            </SettingGroup>

            <SettingGroup title="日志">
                <SettingRow label="查看登录日志" showChevron />
                <SettingRow label="查看操作日志" showChevron />
            </SettingGroup>
        </div>
    );
}
