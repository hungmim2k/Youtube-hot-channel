
import React, { useState, useRef, useEffect } from 'react';
import { LogoIcon, UserIcon, BellIcon, SearchIcon, GridIcon } from './icons/Icons';
import { QuotaDisplay } from './QuotaDisplay';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../shims';
import { useAuth } from '../contexts/AuthContext';

export const HudHeader: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout, isUserExpired } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Format expiration date
    const formatExpiration = () => {
        if (!user) return '';

        if (user.expiration === 'never') {
            return t('account.expiresNever');
        }

        const expirationDate = new Date(user.expiration);
        const isExpired = isUserExpired(user);

        if (isExpired) {
            return t('account.expired');
        }

        return `${t('account.expiresOn')} ${expirationDate.toLocaleDateString()}`;
    };

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
    };

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
                        {user && (
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 p-2 rounded-md border border-transparent hover:border-hud-border transition-colors"
                                >
                                    <UserIcon className="w-7 h-7 rounded-full p-1 bg-hud-border"/>
                                    <div className="hidden md:block text-left">
                                        <div className="text-sm font-medium text-hud-text">{user.username}</div>
                                        <div className="text-xs text-hud-text-secondary">{formatExpiration()}</div>
                                    </div>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-hud-bg-secondary border border-hud-border rounded-md shadow-lg z-50">
                                        <div className="p-3 border-b border-hud-border">
                                            <p className="text-sm font-medium text-hud-text">{t('account.welcome')}, {user.username}</p>
                                            <p className="text-xs text-hud-text-secondary">{user.role}</p>
                                        </div>
                                        <div className="p-2">
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-hud-text hover:bg-hud-bg rounded-md"
                                            >
                                                {t('account.logout')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
