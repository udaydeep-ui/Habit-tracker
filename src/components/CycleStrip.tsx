import React from 'react';
import { useTracker, getCycleKey } from '../context/TrackerContext';
import { DayTypeTag } from './DayTypeTag';
import { StatusBadge } from './StatusBadge';
import { ChevronLeft, ChevronRight, PlusCircle, RotateCw, CheckCircle2 } from 'lucide-react';

export const CycleStrip: React.FC = () => {
  const {
    program,
    logs,
    activeLoop,
    activeCycleDayNumber,
    setActiveLoop,
    setActiveCycleDay,
    advanceToNextLoop,
    getLog,
  } = useTracker();

  const cycleLength = program.cycleLength || 9;

  // Check how many days in activeLoop are completed
  let loopCompletedCount = 0;
  for (let d = 1; d <= cycleLength; d++) {
    const l = getLog(activeLoop, d);
    if (l.status === 'completed') loopCompletedCount++;
  }
  const isLoopComplete = loopCompletedCount === cycleLength;

  const getBorderColor = (type: string, isSelected: boolean) => {
    if (isSelected) {
      return 'ring-2 ring-emerald-400 border-emerald-400 bg-slate-800/90 shadow-lg shadow-emerald-500/20';
    }
    switch (type) {
      case 'easy':
        return 'border-emerald-500/30 hover:border-emerald-400/60 bg-slate-900/60';
      case 'hard':
        return 'border-orange-500/30 hover:border-orange-400/60 bg-slate-900/60';
      case 'rest':
        return 'border-slate-700/60 hover:border-slate-500/60 bg-slate-900/40';
      case 'long_run':
        return 'border-cyan-500/30 hover:border-cyan-400/60 bg-slate-900/60';
      default:
        return 'border-slate-800 bg-slate-900/60';
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Loop Switcher & Progression Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          {/* Loop switcher buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              type="button"
              disabled={activeLoop <= 1}
              onClick={() => setActiveLoop(activeLoop - 1)}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Previous Loop"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-2 text-xs font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Loop #{activeLoop}</span>
              {isLoopComplete && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" title="Loop 100% Completed" />
              )}
            </span>

            <button
              type="button"
              onClick={() => setActiveLoop(activeLoop + 1)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Next Loop"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            ({loopCompletedCount}/{cycleLength} Days Done)
          </span>

          {/* New Loop recurring button */}
          <button
            type="button"
            onClick={advanceToNextLoop}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono flex items-center gap-1 transition-all active:scale-95"
            title="Complete current cycle and start a fresh loop"
          >
            <RotateCw size={12} />
            <span>+ Start Next Loop</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
          <span className="text-slate-300 font-bold">Unsynced Recurring Cycle</span>
          <span className="text-slate-500">&bull;</span>
          <span>Click any day to view or log</span>
        </div>
      </div>

      {/* 9-Day Horizontal Rail */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 pb-1">
        {program.days.map((day) => {
          const isCurrentSelected = day.dayNumber === activeCycleDayNumber;
          const dayLog = getLog(activeLoop, day.dayNumber);
          const status = dayLog.status;

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => setActiveCycleDay(day.dayNumber)}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all duration-200 relative group cursor-pointer ${getBorderColor(
                day.type,
                isCurrentSelected
              )}`}
            >
              {/* Top row: Day Number & Type Pill */}
              <div className="flex items-center justify-between mb-1.5 w-full">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
                    day.type === 'easy'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : day.type === 'hard'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : day.type === 'long_run'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {day.dayNumber}
                </span>

                <DayTypeTag type={day.type} size="sm" />
              </div>

              {/* Title */}
              <div className="font-bold text-xs text-slate-200 line-clamp-1 group-hover:text-white mb-2">
                {day.title}
              </div>

              {/* Status footer */}
              <div className="mt-auto pt-1 flex items-center justify-between border-t border-slate-800/80 w-full">
                <span className="text-[10px] text-slate-500 font-mono">
                  {day.type === 'rest' ? 'Rest Day' : `${day.targetDurationMin}m`}
                </span>
                <StatusBadge status={status} size="sm" interactive={false} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
