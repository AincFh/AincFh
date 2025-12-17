import { SettingGroup, SettingRow } from './SettingGroup';
import { Switch } from '@/admin/components/ui/Switch';

interface SEOSettingsProps {
    settings: any;
    updateSetting: (section: string, key: string, value: any) => void;
}

export function SEOSettings({ settings, updateSetting }: SEOSettingsProps) {
    return (
        <div className="space-y-6">
            <SettingGroup title="搜索引擎优化">
                <SettingRow
                    label="生成 Sitemap"
                    description="自动生成 sitemap.xml 文件"
                >
                    <Switch
                        checked={settings?.sitemapEnabled !== false}
                        onChange={(val) => updateSetting('seo', 'sitemapEnabled', val)}
                    />
                </SettingRow>
                <SettingRow label="Robots.txt" showChevron />
                <SettingRow label="Meta 描述模板" showChevron />
            </SettingGroup>

            <SettingGroup title="社交媒体">
                <SettingRow label="Open Graph 图片" showChevron />
                <SettingRow label="Twitter Card 类型" value="Large Image" showChevron />
                <SettingRow label="Facebook App ID" showChevron />
            </SettingGroup>

            <SettingGroup title="网站分析">
                <SettingRow label="Google Analytics" showChevron />
                <SettingRow label="百度统计" showChevron />
                <SettingRow label="Google Search Console" showChevron />
            </SettingGroup>

            <SettingGroup title="社交链接">
                <SettingRow label="Twitter" showChevron />
                <SettingRow label="GitHub" showChevron />
                <SettingRow label="Facebook" showChevron />
                <SettingRow label="Instagram" showChevron />
            </SettingGroup>
        </div>
    );
}
