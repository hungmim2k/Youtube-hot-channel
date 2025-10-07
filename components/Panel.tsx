
import React from 'react';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className }) => {
  return (
    <div className={`relative bg-hud-bg-secondary bg-opacity-50 border border-hud-border p-4 sm:p-6 rounded-md shadow-lg ${className}`}>
      {/* Corner brackets */}
      <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-hud-accent opacity-50"></div>
      <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-hud-accent opacity-50"></div>
      <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-hud-accent opacity-50"></div>
      <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-hud-accent opacity-50"></div>

      <div className="relative z-10">
        <h2 className="text-hud-accent font-bold uppercase tracking-widest text-sm mb-4 border-b-2 border-hud-border pb-2">{title}</h2>
        {children}
      </div>
    </div>
  );
};
