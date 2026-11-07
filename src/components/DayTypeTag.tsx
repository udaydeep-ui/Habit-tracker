import React from 'react';
import { DayType } from '../types';

interface DayTypeTagProps {
  type: DayType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DayTypeTag: React.FC<DayTypeTagProps> = ({
  type,
  size = 'md',
  className = '',
}) => {
  const configs = {
    easy: {
      label: 'EASY',
      badgeClass: 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.35)]',
      borderClass: 'border-emerald-500/50',
    },
    hard: {
      label: 'HARD',
      badgeClass: 'bg-orange-500 text-slate-950 font-black shadow-[0_0_12px_rgba(249,115,22,0.35)]',
      borderClass: 'border-orange-500/50',
    },
    rest: {
      label: 'REST',
      badgeClass: 'bg-slate-500 text-slate-100 font-bold shadow-[0_0_10px_rgba(100,116,139,0.25)]',
      borderClass: 'border-slate-600/50',
    },
    long_run: {
      label: 'LONG RUN',
      badgeClass: 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.35)]',
      borderClass: 'border-cyan-500/50',
    },
  };

  const current = configs[type] || configs.easy;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wider rounded-md',
    md: 'px-2.5 py-1 text-xs tracking-wider rounded-lg',
    lg: 'px-3.5 py-1.5 text-sm tracking-wider rounded-xl',
  };

  return (
    <span
      className={`inline-flex items-center uppercase font-mono ${sizeClasses[size]} ${current.badgeClass} ${className}`}
    >
      {current.label}
    </span>
  );
};
