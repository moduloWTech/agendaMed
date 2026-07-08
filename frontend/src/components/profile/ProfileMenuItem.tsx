import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
}

export function ProfileMenuItem({
  icon,
  title,
  subtitle,
  onClick,
  danger = false
}: ProfileMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white/70 backdrop-blur-md rounded-2xl mb-3 shadow-sm border border-white/60 transition-all hover:bg-white active:scale-[0.98] ${
        danger ? 'text-red-500' : 'text-gray-700'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
          {icon}
        </div>
        <div className="flex flex-col items-start text-left">
          <span className={`font-semibold ${danger ? 'text-red-600' : 'text-gray-800'}`}>{title}</span>
          {subtitle && <span className="text-xs text-gray-500 mt-0.5">{subtitle}</span>}
        </div>
      </div>
      {!danger && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </button>
  );
}
