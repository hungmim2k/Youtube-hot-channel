import React from 'react';
import { useTranslation } from '../../shims';
import { UserManagement } from './UserManagement';
import { KeywordTracking } from './KeywordTracking';

export const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-hud-text">{t('admin.adminPanel')}</h2>
      <UserManagement />
      <KeywordTracking />
    </div>
  );
};