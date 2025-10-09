import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../shims';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError(t('login.errorEmptyFields'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError(t('login.errorInvalidCredentials'));
      }
    } catch (err) {
      setError(t('login.errorGeneric'));
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hud-bg">
      <div className="w-full max-w-md p-8 space-y-8 bg-hud-bg-secondary rounded-lg shadow-lg border border-hud-border">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-hud-text">{t('login.title')}</h1>
          <p className="mt-2 text-sm text-hud-text-secondary">{t('login.subtitle')}</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-hud-text-secondary">
                {t('login.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md text-hud-text focus:outline-none focus:ring-2 focus:ring-hud-accent"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-hud-text-secondary">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md text-hud-text focus:outline-none focus:ring-2 focus:ring-hud-accent"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-hud-red text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-hud-bg bg-hud-accent hover:bg-hud-accent-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hud-accent disabled:opacity-50"
            >
              {isLoading ? t('login.loggingIn') : t('login.loginButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};