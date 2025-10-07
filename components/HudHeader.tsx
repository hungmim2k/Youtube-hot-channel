
import React from 'react';
import { LogoIcon, UserIcon, BellIcon, SearchIcon, GridIcon } from './icons/Icons';
import { QuotaDisplay } from './QuotaDisplay';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../shims';

export const HudHeader: React.FC = () => {
    const { t } = useTranslation();

    return (
        <header className="bg-hud-bg-secondary/50 border-b border-hud-border backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <LogoIcon className="h-8 w-8 text-hud-accent" />
                        <span className="ml-3 text-xl font-bold tracking-wider text-hud-text">{t('app.title')}</span>
                    </div>
                    <QuotaDisplay />
                    <div className="flex items-center space-x-4 text-hud-text-secondary">
                        <LanguageSwitcher />
                        <button className="p-2 hover:text-hud-accent transition-colors"><SearchIcon className="w-5 h-5"/></button>
                        <button className="p-2 hover:text-hud-accent transition-colors"><GridIcon className="w-5 h-5"/></button>
                        <button className="p-2 hover:text-hud-accent transition-colors relative">
                            <BellIcon className="w-5 h-5"/>
                            <span className="absolute top-1 right-1.5 block h-2 w-2 rounded-full bg-hud-green ring-2 ring-hud-bg-secondary"></span>
                        </button>
                        <div className="flex items-center space-x-2 p-2 rounded-md border border-transparent hover:border-hud-border transition-colors">
                            <UserIcon className="w-7 h-7 rounded-full p-1 bg-hud-border"/>
                            <span className="text-sm text-hud-text hidden md:block">username@account.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
