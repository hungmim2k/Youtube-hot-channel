
import React from 'react';

interface TabProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ isActive, onClick, children }) => {
  const baseClasses = "flex items-center text-sm sm:text-base font-semibold px-4 py-2.5 sm:px-6 sm:py-3 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-hud-accent";
  const activeClasses = "bg-hud-accent text-hud-bg shadow-hud";
  const inactiveClasses = "bg-hud-bg-secondary text-hud-text-secondary hover:bg-hud-border hover:text-hud-text";
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </button>
  );
};

interface TabsProps {
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children }) => {
  return (
    <div role="tablist" className="flex space-x-1 sm:space-x-2 bg-hud-bg-secondary p-1 rounded-md border border-hud-border">
      {children}
    </div>
  );
};
