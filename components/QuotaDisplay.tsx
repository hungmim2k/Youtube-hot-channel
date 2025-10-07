import React from 'react';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { useTranslation } from '../shims';

export const QuotaDisplay: React.FC = () => {
  const { activeKey, activeKeyQuotaInfo, apiKeys } = useApiKeys();
  const { t } = useTranslation();

  if (!activeKey || apiKeys.length === 0) {
    return null;
  }

  const { used, remaining, percentage } = activeKeyQuotaInfo;

  // Determine color based on usage percentage
  let barColor = 'bg-hud-green';
  if (percentage > 70) barColor = 'bg-yellow-500';
  if (percentage > 90) barColor = 'bg-hud-red';

  return (
    <div className="flex items-center space-x-2 text-hud-text-secondary">
      <div className="hidden md:block text-xs">{t('quotaDisplay.apiQuota')}</div>
      <div className="relative w-24 h-2 bg-hud-bg-secondary rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs whitespace-nowrap">{percentage}% {t('quotaDisplay.used')}</div>
    </div>
  );
};
