import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../shims';
import { Panel } from '../Panel';

export const KeywordTracking: React.FC = () => {
  const { getKeywords, users } = useAuth();
  const { t } = useTranslation();
  const [filteredKeywords, setFilteredKeywords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    username: '',
    fromDate: '',
    toDate: ''
  });

  // State for error message
  const [error, setError] = useState<string | null>(null);

  // Apply filters and update the filtered keywords
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const activeFilters: { username?: string; fromDate?: string; toDate?: string } = {};

        if (filters.username) {
          activeFilters.username = filters.username;
        }

        if (filters.fromDate) {
          activeFilters.fromDate = filters.fromDate;
        }

        if (filters.toDate) {
          activeFilters.toDate = filters.toDate;
        }

        const keywords = Object.keys(activeFilters).length > 0
          ? await getKeywords(activeFilters)
          : await getKeywords();

        setFilteredKeywords(keywords);
      } catch (error) {
        console.error('Error fetching keywords:', error);
        setFilteredKeywords([]);

        // Check if the error might be related to missing tables
        if (error instanceof Error && 
            (error.message.includes('does not exist') || 
             error.message.includes('not found') ||
             error.message.includes('no such table'))) {
          setError(t('admin.databaseTablesNotFound'));
        } else {
          setError(t('admin.errorFetchingKeywords'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeywords();
  }, [filters, getKeywords, t]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      username: '',
      fromDate: '',
      toDate: ''
    });
  };

  return (
    <Panel title={t('admin.keywordTracking')}>
      <div className="space-y-6">
        <div className="bg-hud-bg-secondary p-4 rounded-md border border-hud-border">
          <h3 className="text-lg font-medium mb-4">{t('admin.filter')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                {t('admin.filterByUser')}
              </label>
              <select
                name="username"
                value={filters.username}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
              >
                <option value="">{t('admin.allUsers')}</option>
                {users.map(user => (
                  <option key={user.username} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                {t('admin.fromDate')}
              </label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                {t('admin.toDate')}
              </label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-hud-border rounded-md hover:bg-hud-bg"
            >
              {t('admin.clearFilters')}
            </button>
          </div>
        </div>

        <div className="bg-hud-bg-secondary p-4 rounded-md border border-hud-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{t('admin.totalKeywords')}: {filteredKeywords.length}</h3>
          </div>

          {error && (
            <div className="text-center py-8">
              <p className="text-hud-red mb-2">{error}</p>
              <p className="text-hud-text-secondary text-sm">
                {t('admin.databaseTablesNotFound') === error && (
                  <>
                    {t('admin.runMigration')}
                    <br />
                    <code className="bg-hud-bg p-1 rounded mt-2 inline-block">npm run migrate:js</code>
                  </>
                )}
              </p>
            </div>
          )}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-hud-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-hud-text-secondary">Loading keywords...</p>
            </div>
          ) : !error && filteredKeywords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-hud-border">
                <thead className="bg-hud-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                      {t('admin.keyword')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                      {t('admin.user')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                      {t('admin.ip')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                      {t('admin.timestamp')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-hud-bg-secondary divide-y divide-hud-border">
                  {filteredKeywords.map((keyword, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-hud-text">
                        {keyword.keyword}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">
                        {keyword.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">
                        {keyword.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">
                        {new Date(keyword.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-hud-text-secondary">
              {t('admin.noKeywordsFound')}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
};
