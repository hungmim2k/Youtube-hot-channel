import React from 'react';
import { useTranslation } from '../shims';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2 text-hud-text-secondary">
      <button
        className={`px-2 py-1 rounded-md transition-colors ${
          currentLanguage === 'en' ? 'bg-hud-accent text-hud-bg' : 'hover:text-hud-accent'
        }`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button
        className={`px-2 py-1 rounded-md transition-colors ${
          currentLanguage === 'vi' ? 'bg-hud-accent text-hud-bg' : 'hover:text-hud-accent'
        }`}
        onClick={() => changeLanguage('vi')}
      >
        VI
      </button>
    </div>
  );
};

export default LanguageSwitcher;
