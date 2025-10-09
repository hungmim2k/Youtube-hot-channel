import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../shims';
import { Panel } from '../Panel';
import { UserRecord, Expiration } from '../../contexts/AuthContext';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const { t } = useTranslation();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [expiration, setExpiration] = useState<Expiration>('never');
  const [expirationDate, setExpirationDate] = useState('');
  const [apiKeys, setApiKeys] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setExpiration('never');
    setExpirationDate('');
    setApiKeys('');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const finalExpiration = expiration === 'never' ? 'never' : expirationDate;
      const apiKeysList = apiKeys.split('\n').filter(Boolean).map(key => key.trim());
      
      const success = await addUser(username, password, finalExpiration, apiKeysList);
      
      if (success) {
        setMessage({ text: t('admin.userAdded'), type: 'success' });
        resetForm();
        setIsAddingUser(false);
      } else {
        setMessage({ text: t('admin.errorAddingUser'), type: 'error' });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setMessage({ text: t('admin.errorAddingUser'), type: 'error' });
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditingUser) return;
    
    try {
      const updates: Partial<Omit<UserRecord, 'username' | 'role'>> = {};
      
      if (password) {
        updates.password = password;
      }
      
      if (expiration === 'never') {
        updates.expiration = 'never';
      } else if (expirationDate) {
        updates.expiration = expirationDate;
      }
      
      if (apiKeys) {
        updates.apiKeys = apiKeys.split('\n').filter(Boolean).map(key => key.trim());
      }
      
      const success = await updateUser(isEditingUser, updates);
      
      if (success) {
        setMessage({ text: t('admin.userUpdated'), type: 'success' });
        resetForm();
        setIsEditingUser(null);
      } else {
        setMessage({ text: t('admin.errorUpdatingUser'), type: 'error' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage({ text: t('admin.errorUpdatingUser'), type: 'error' });
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      try {
        const success = await deleteUser(username);
        
        if (success) {
          setMessage({ text: t('admin.userDeleted'), type: 'success' });
        } else {
          setMessage({ text: t('admin.errorDeletingUser'), type: 'error' });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setMessage({ text: t('admin.errorDeletingUser'), type: 'error' });
      }
    }
  };

  const startEditUser = (user: UserRecord) => {
    setIsEditingUser(user.username);
    setUsername(user.username);
    setPassword(''); // Don't show the current password
    setExpiration(user.expiration);
    if (user.expiration !== 'never') {
      setExpirationDate(user.expiration);
    }
    setApiKeys((user.apiKeys || []).join('\n'));
  };

  return (
    <Panel title={t('admin.userManagement')}>
      <div className="space-y-6">
        {message && (
          <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={() => {
              resetForm();
              setIsAddingUser(true);
              setIsEditingUser(null);
            }}
            className="bg-hud-accent hover:bg-hud-accent-secondary text-hud-bg px-4 py-2 rounded-md"
          >
            {t('admin.addUser')}
          </button>
        </div>
        
        {isAddingUser && (
          <div className="bg-hud-bg-secondary p-4 rounded-md border border-hud-border">
            <h3 className="text-lg font-medium mb-4">{t('admin.addUser')}</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                  {t('admin.username')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                  {t('admin.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                  {t('admin.expiration')}
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={expiration === 'never'}
                      onChange={() => setExpiration('never')}
                      className="form-radio"
                    />
                    <span className="ml-2">{t('admin.neverExpires')}</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={expiration !== 'never'}
                      onChange={() => setExpiration('date')}
                      className="form-radio"
                    />
                    <span className="ml-2">{t('admin.setExpiration')}</span>
                  </label>
                </div>
                
                {expiration !== 'never' && (
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    required
                    className="mt-2 w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                  {t('admin.apiKeys')} ({t('apiSettings.apiKeys')})
                </label>
                <textarea
                  value={apiKeys}
                  onChange={(e) => setApiKeys(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
                  placeholder={t('apiSettings.apiKeysPlaceholder')}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 border border-hud-border rounded-md"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-hud-accent hover:bg-hud-accent-secondary text-hud-bg px-4 py-2 rounded-md"
                >
                  {t('admin.addUser')}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {isEditingUser && (
          <div className="bg-hud-bg-secondary p-4 rounded-md border border-hud-border">
            <h3 className="text-lg font-medium mb-4">{t('admin.editUser')}: {isEditingUser}</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                  {t('admin.password')} ({t('admin.leaveBlankToKeep')})
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                  {t('admin.expiration')}
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={expiration === 'never'}
                      onChange={() => setExpiration('never')}
                      className="form-radio"
                    />
                    <span className="ml-2">{t('admin.neverExpires')}</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={expiration !== 'never'}
                      onChange={() => setExpiration('date')}
                      className="form-radio"
                    />
                    <span className="ml-2">{t('admin.setExpiration')}</span>
                  </label>
                </div>
                
                {expiration !== 'never' && (
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    required
                    className="mt-2 w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hud-text-secondary mb-1">
                  {t('admin.apiKeys')} ({t('apiSettings.apiKeys')})
                </label>
                <textarea
                  value={apiKeys}
                  onChange={(e) => setApiKeys(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md"
                  placeholder={t('apiSettings.apiKeysPlaceholder')}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditingUser(null)}
                  className="px-4 py-2 border border-hud-border rounded-md"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-hud-accent hover:bg-hud-accent-secondary text-hud-bg px-4 py-2 rounded-md"
                >
                  {t('admin.saveChanges')}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-hud-border">
            <thead className="bg-hud-bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                  {t('admin.username')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                  {t('admin.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                  {t('admin.expiration')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                  {t('admin.apiKeys')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                  {t('admin.createdAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-hud-bg divide-y divide-hud-border">
              {users.map((user) => (
                <tr key={user.username}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-hud-text">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">
                    {user.expiration === 'never' 
                      ? t('admin.neverExpires') 
                      : new Date(user.expiration).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">
                    {(user.apiKeys || []).length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEditUser(user)}
                      className="text-hud-accent hover:text-hud-accent-secondary mr-3"
                    >
                      {t('admin.edit')}
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        className="text-hud-red hover:text-red-500"
                      >
                        {t('admin.delete')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
};