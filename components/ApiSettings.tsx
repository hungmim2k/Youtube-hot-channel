import React, { useState, useEffect } from 'react';
import { Panel } from './Panel';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { InfoIcon, CheckCircleIcon, XCircleIcon, SettingsIcon } from './icons/Icons';
import { OptimizationSettings } from './OptimizationSettings';

type KeyStatus = {
    key: string;
    status: 'valid' | 'invalid' | 'pending';
}

export const ApiSettings: React.FC = () => {
  const { apiKeys, setApiKeys, validateKeys, getQuotaInfo, resetQuotaUsage } = useApiKeys();
  const [keysInput, setKeysInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [validationResults, setValidationResults] = useState<KeyStatus[]>([]);
  const [message, setMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const initialKeys = apiKeys.join('\n');
    setKeysInput(initialKeys);
    setValidationResults(apiKeys.map(k => ({ key: k, status: 'pending' })));
  }, [apiKeys]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    const newKeys = keysInput.split('\n').map(k => k.trim()).filter(Boolean);
    setApiKeys(newKeys);

    // Set initial status to pending for UI feedback
    setValidationResults(newKeys.map(k => ({ key: k, status: 'pending' })));

    try {
      const results = await validateKeys(newKeys);
      setValidationResults(results);
      const validCount = results.filter(r => r.status === 'valid').length;
      setMessage(`Validation complete. ${validCount} of ${newKeys.length} key(s) are valid.`);
    } catch (error) {
      setMessage('An error occurred during validation.');
      setValidationResults(newKeys.map(k => ({ key: k, status: 'invalid' })));
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleResetQuota = (key?: string) => {
    setIsResetting(true);
    resetQuotaUsage(key);
    setMessage(key ? `Quota reset for key: ${key.substring(0, 10)}...` : 'All quota usage reset.');
    setTimeout(() => {
      setIsResetting(false);
      setMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <Panel title="API Key Management">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="space-y-4">
              <div>
              <label htmlFor="api-keys" className="block text-sm font-medium text-hud-text-secondary mb-2">
                  YouTube Data API v3 Keys (one per line)
              </label>
              <textarea
                  id="api-keys"
                  rows={5}
                  value={keysInput}
                  onChange={(e) => setKeysInput(e.target.value)}
                  placeholder="Enter your API keys here..."
                  className="w-full bg-hud-bg-secondary border border-hud-border rounded-md px-3 py-2 text-hud-text focus:ring-2 focus:ring-hud-accent focus:outline-none font-mono text-xs"
              />
              </div>
              <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-hud-accent hover:bg-hud-accent-secondary text-hud-bg font-bold py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
              {isSaving ? 'Validating...' : 'Save & Validate Keys'}
              </button>
              {message && <p className="text-hud-green text-xs text-center mt-2">{message}</p>}
              <div className="flex items-start p-3 bg-hud-bg-secondary border-l-4 border-hud-accent-secondary mt-4 rounded-r-md">
              <InfoIcon className="w-5 h-5 text-hud-accent-secondary mr-3 flex-shrink-0 mt-1" />
              <p className="text-xs text-hud-text-secondary">
                  Your API keys are stored locally in your browser. Get keys from the Google Cloud Console.
              </p>
              </div>
          </div>

          <div className="space-y-2">
              <h3 className="text-sm font-medium text-hud-text-secondary mb-2">Key Status</h3>
              <div className="p-3 bg-hud-bg rounded-md border border-hud-border h-64 overflow-y-auto">
                  {validationResults.length === 0 && <p className="text-xs text-hud-text-secondary">No keys entered.</p>}
                  <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-hud-text-secondary">API Keys Status</h4>
                      <button 
                          onClick={() => handleResetQuota()} 
                          disabled={isResetting || validationResults.length === 0}
                          className="text-xs bg-hud-border hover:bg-hud-accent hover:text-hud-bg px-2 py-1 rounded-md transition-all disabled:opacity-50 flex items-center"
                      >
                          <SettingsIcon className="w-3 h-3 mr-1" />
                          Reset All Quotas
                      </button>
                  </div>
                  <ul className="space-y-3">
                      {validationResults.map(({ key, status }) => {
                          const quotaInfo = getQuotaInfo(key);
                          let barColor = 'bg-hud-green';
                          if (quotaInfo.percentage > 70) barColor = 'bg-yellow-500';
                          if (quotaInfo.percentage > 90) barColor = 'bg-hud-red';

                          return (
                              <li key={key} className="text-xs font-mono">
                                  <div className="flex items-center">
                                      {status === 'valid' && <CheckCircleIcon className="w-4 h-4 text-hud-green mr-2 flex-shrink-0" />}
                                      {status === 'invalid' && <XCircleIcon className="w-4 h-4 text-hud-red mr-2 flex-shrink-0" />}
                                      {status === 'pending' && <div className="w-3 h-3 border-2 border-hud-text-secondary border-t-transparent rounded-full animate-spin mr-2.5 flex-shrink-0"></div>}
                                      <span className="truncate flex-1">{key}</span>
                                      <span className={`ml-2 font-sans font-bold ${status === 'valid' ? 'text-hud-green' : status === 'invalid' ? 'text-hud-red' : 'text-hud-text-secondary'}`}>{status}</span>
                                  </div>

                                  {status === 'valid' && (
                                      <div className="mt-1 pl-6">
                                          <div className="flex items-center justify-between mb-1">
                                              <span className="text-hud-text-secondary">Quota: {quotaInfo.used} / 10,000</span>
                                              <button 
                                                  onClick={() => handleResetQuota(key)} 
                                                  disabled={isResetting}
                                                  className="text-xs bg-hud-border hover:bg-hud-accent hover:text-hud-bg px-1.5 py-0.5 rounded-sm transition-all disabled:opacity-50"
                                              >
                                                  Reset
                                              </button>
                                          </div>
                                          <div className="relative h-1.5 bg-hud-bg-secondary rounded-full overflow-hidden">
                                              <div 
                                                  className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-300`} 
                                                  style={{ width: `${quotaInfo.percentage}%` }}
                                              ></div>
                                          </div>
                                      </div>
                                  )}
                              </li>
                          );
                      })}
                  </ul>
              </div>
          </div>
        </div>
      </Panel>

      <OptimizationSettings />
    </div>
  );
};
