import React from 'react';
import { Check, X, Minus, Circle } from 'lucide-react';
import { TaskStatus } from '../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showLabel?: boolean;
  interactive?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  onClick,
  showLabel = false,
  interactive = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-14 h-14 text-xl',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 26,
  };

  const statusConfig = {
    completed: {
      bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      hover: 'hover:bg-emerald-500/30 hover:border-emerald-400',
      icon: <Check size={iconSizes[size]} strokeWidth={3} className="text-emerald-400" />,
      label: 'Completed',
      symbol: '✓',
    },
    failed: {
      bg: 'bg-rose-500/20 text-rose-400 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
      hover: 'hover:bg-rose-500/30 hover:border-rose-400',
      icon: <X size={iconSizes[size]} strokeWidth={3} className="text-rose-400" />,
      label: 'Failed',
      symbol: '✗',
    },
    postponed_cancelled: {
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      hover: 'hover:bg-amber-500/30 hover:border-amber-400',
      icon: <Minus size={iconSizes[size]} strokeWidth={3.5} className="text-amber-400" />,
      label: 'Postponed / Cancelled',
      symbol: '−',
    },
    pending: {
      bg: 'bg-slate-800/60 text-slate-400 border-slate-700/80',
      hover: 'hover:bg-slate-800 hover:border-slate-500',
      icon: <Circle size={iconSizes[size] - 2} strokeWidth={2} className="text-slate-500 opacity-60" />,
      label: 'Pending',
      symbol: '○',
    },
  };

  const current = statusConfig[status] || statusConfig.pending;

  return (
    <div
      onClick={interactive ? onClick : undefined}
      title={interactive ? `Click to cycle status: Current is ${current.label}` : current.label}
      className={`inline-flex items-center gap-2 select-none ${
        interactive ? 'cursor-pointer transition-all duration-200 active:scale-95' : ''
      } ${className}`}
    >
      <div
        className={`rounded-xl border flex items-center justify-center font-bold transition-all ${
          sizeClasses[size]
        } ${current.bg} ${interactive ? current.hover : ''}`}
      >
        {current.icon}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {current.label}
        </span>
      )}
    </div>
  );
};

interface StatusQuickPickerProps {
  currentStatus: TaskStatus;
  onChange: (status: TaskStatus) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusQuickPicker: React.FC<StatusQuickPickerProps> = ({
  currentStatus,
  onChange,
  className = '',
  size = 'md',
}) => {
  const pad = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div className={`inline-flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl gap-1 shadow-inner ${className}`}>
      <button
        type="button"
        onClick={() => onChange('completed')}
        className={`flex items-center gap-1.5 rounded-lg font-bold transition-all ${pad} ${
          currentStatus === 'completed'
            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
            : 'text-emerald-400 hover:bg-emerald-500/10'
        }`}
        title="Completed (Tick)"
      >
        <Check size={size === 'sm' ? 14 : 16} strokeWidth={3} />
        <span>Tick</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('failed')}
        className={`flex items-center gap-1.5 rounded-lg font-bold transition-all ${pad} ${
          currentStatus === 'failed'
            ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/30'
            : 'text-rose-400 hover:bg-rose-500/10'
        }`}
        title="Failed (Cross)"
      >
        <X size={size === 'sm' ? 14 : 16} strokeWidth={3} />
        <span>Cross</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('postponed_cancelled')}
        className={`flex items-center gap-1.5 rounded-lg font-bold transition-all ${pad} ${
          currentStatus === 'postponed_cancelled'
            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
            : 'text-amber-300 hover:bg-amber-400/10'
        }`}
        title="Postponed or Cancelled (Yellow Minus)"
      >
        <Minus size={size === 'sm' ? 14 : 16} strokeWidth={3.5} />
        <span>Minus</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('pending')}
        className={`rounded-lg transition-all text-slate-400 hover:bg-slate-800 ${
          currentStatus === 'pending' ? 'bg-slate-800 text-slate-200' : ''
        } ${pad}`}
        title="Reset to Pending"
      >
        <Circle size={size === 'sm' ? 12 : 14} />
      </button>
    </div>
  );
};
