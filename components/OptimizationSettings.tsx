import React from 'react';
import { Panel } from './Panel';
import { useOptimization } from '../contexts/OptimizationContext';
import { InfoIcon } from './icons/Icons';
import { useTranslation } from '../shims';

export const OptimizationSettings: React.FC = () => {
  const { settings, updateSetting, resetToDefaults } = useOptimization();
  const { t } = useTranslation();

  // Handler for number input changes
  const handleNumberChange = (key: keyof typeof settings, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      updateSetting(key, numValue);
    }
  };

  return (
    <Panel title={t('optimization.title')}>
      <div className="space-y-6">
        <div className="flex items-start p-4 bg-hud-bg-secondary border-l-4 border-hud-accent-secondary rounded-r-md">
          <InfoIcon className="w-5 h-5 text-hud-accent-secondary mr-3 flex-shrink-0 mt-1" />
          <p className="text-sm text-hud-text-secondary">
            {t('optimization.infoText')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hot Channels Finder Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-hud-text-secondary">{t('optimization.hotChannelsSettings')}</h3>

            <div>
              <label className="block text-xs text-hud-text-secondary mb-1">
                {t('optimization.searchDepth')}
                <span className="ml-2 text-hud-text-secondary">{t('optimization.searchDepthInfo')}</span>
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.searchDepth}
                onChange={(e) => handleNumberChange('searchDepth', e.target.value)}
                className="w-full bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-hud-text-secondary mb-1">
                {t('optimization.channelSearchDepth')}
                <span className="ml-2 text-hud-text-secondary">{t('optimization.channelSearchDepthInfo')}</span>
              </label>
              <input
                type="number"
                min="1"
                max="3"
                value={settings.channelSearchDepth}
                onChange={(e) => handleNumberChange('channelSearchDepth', e.target.value)}
                className="w-full bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-hud-text-secondary mb-1">
                {t('optimization.relatedChannelDepth')}
                <span className="ml-2 text-hud-text-secondary">{t('optimization.relatedChannelDepthInfo')}</span>
              </label>
              <input
                type="number"
                min="0"
                max="2"
                value={settings.relatedSearchDepth}
                onChange={(e) => handleNumberChange('relatedSearchDepth', e.target.value)}
                className="w-full bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Other Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-hud-text-secondary">{t('optimization.otherSettings')}</h3>

            <div>
              <label className="block text-xs text-hud-text-secondary mb-1">
                {t('optimization.trendingPages')}
                <span className="ml-2 text-hud-text-secondary">{t('optimization.trendingPagesInfo')}</span>
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.trendingMaxPages}
                onChange={(e) => handleNumberChange('trendingMaxPages', e.target.value)}
                className="w-full bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-hud-text-secondary mb-1">
                {t('optimization.cacheDuration')}
                <span className="ml-2 text-hud-text-secondary">{t('optimization.cacheDurationInfo')}</span>
              </label>
              <input
                type="number"
                min="1"
                max="72"
                value={settings.cacheDurationHours}
                onChange={(e) => handleNumberChange('cacheDurationHours', e.target.value)}
                className="w-full bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={resetToDefaults}
                className="w-full bg-hud-border hover:bg-hud-accent hover:text-hud-bg px-4 py-2 rounded-md transition-all text-sm"
              >
                {t('optimization.resetButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};
