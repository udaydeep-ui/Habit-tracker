import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { DayTypeTag } from './DayTypeTag';
import { StatusBadge } from './StatusBadge';
import { ChevronRight } from 'lucide-react';

export const CycleStrip: React.FC = () => {
  const { program, logs, selectedDate, setSelectedDate, currentCycleDayNumber, currentLoop } = useTracker();

  // Find latest log for each cycle day
  const getCycleDayStatus = (dayNum: number) => {
    // Look for matching log for this loop or recent dates
    const relevantDates = Object.keys(logs).filter((d) => logs[d].cycleDayNumber === dayNum);
    if (relevantDates.length === 0) return 'pending';
    // Get the most recent date for this cycle day
    relevantDates.sort().reverse();
    return logs[relevantDates[0]].status;
  };

  const getBorderColor = (type: string, isSelected: boolean) => {
    if (isSelected) return 'ring-2 ring-emerald-400 border-emerald-400 bg-slate-800/90 shadow-lg shadow-emerald-500/10';
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
            9-Day Program Rail
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            Loop #{currentLoop}
          </span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
          <span>Synced to Gym Cycle</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* Horizontal scrollable track */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 pb-1">
        {program.days.map((day) => {
          const isCurrentSelected = day.dayNumber === currentCycleDayNumber;
          const status = getCycleDayStatus(day.dayNumber);

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => {
                // If selected date is already matching cycleDayNumber, do nothing, else find or use date
                const matchDate = Object.keys(logs).find((d) => logs[d].cycleDayNumber === day.dayNumber);
                if (matchDate) {
                  setSelectedDate(matchDate);
                }
              }}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all duration-200 relative group ${getBorderColor(
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
