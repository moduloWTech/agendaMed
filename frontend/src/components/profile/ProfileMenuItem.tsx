import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
  showBadge?: boolean;
}

export function ProfileMenuItem({
  icon,
  title,
  subtitle,
  onClick,
  danger = false,
  showBadge = false
}: ProfileMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl mb-3 shadow-sm border border-white/60 dark:border-slate-700/50 transition-all hover:bg-white dark:hover:bg-slate-800 active:scale-[0.98] ${
        danger ? 'text-red-500' : 'text-gray-700 dark:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
          {icon}
        </div>
        <div className="flex flex-col items-start text-left relative">
          <span className={`font-semibold flex items-center gap-2 ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-slate-100'}`}>
            {title}
            {showBadge && (
              <span className="flex w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </span>
          {subtitle && <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</span>}
        </div>
      </div>
      {!danger && <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500" />}
    </button>
  );
}
