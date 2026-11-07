import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { StatusBadge } from './StatusBadge';

export const CalendarMatrix: React.FC = () => {
  const { logs, program, setActiveLoop, setActiveCycleDay } = useTracker();
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get total days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper to format date string YYYY-MM-DD
  const formatDateKey = (dNum: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(dNum).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  // Find workout log performed on this date
  const findLogForDate = (dateKey: string) => {
    return Object.values(logs).find((l) => l.date === dateKey);
  };

  const getDayDotColor = (cycleDayNum: number) => {
    const dayObj = program.days.find((d) => d.dayNumber === cycleDayNum);
    if (!dayObj) return 'bg-slate-600';
    if (dayObj.type === 'easy') return 'bg-emerald-400';
    if (dayObj.type === 'hard') return 'bg-orange-400';
    if (dayObj.type === 'long_run') return 'bg-cyan-400';
    return 'bg-slate-500';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">{monthName}</h3>
            <p className="text-xs text-slate-400">Workout Execution Calendar (Logged Sessions)</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonthDate(new Date())}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-white"
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Empty slots before month start */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[85px] rounded-xl bg-slate-950/20 border border-slate-900" />
        ))}

        {/* Days of month */}
        {daysArray.map((dayNum) => {
          const dateKey = formatDateKey(dayNum);
          const log = findLogForDate(dateKey);
          const hasLog = Boolean(log);
          const status = log?.status || 'pending';
          const cycleDayNum = log?.cycleDayNumber;
          const loopNum = log?.loopNumber;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => {
                if (log) {
                  setActiveLoop(log.loopNumber);
                  setActiveCycleDay(log.cycleDayNumber);
                }
              }}
              className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-xl border flex flex-col justify-between text-left transition-all relative group cursor-pointer ${
                hasLog
                  ? 'bg-slate-950/90 border-slate-700/80 hover:border-emerald-500 hover:bg-slate-900'
                  : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
              }`}
            >
              {/* Day header: Day Number & Cycle Indicator Dot */}
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {dayNum}
                </span>

                {cycleDayNum && (
                  <div className="flex items-center gap-1" title={`Loop ${loopNum} Day ${cycleDayNum}`}>
                    <span className={`w-2 h-2 rounded-full ${getDayDotColor(cycleDayNum)}`} />
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      L{loopNum}D{cycleDayNum}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Indicator Icon in center */}
              <div className="my-auto flex justify-center">
                {hasLog && status !== 'pending' ? (
                  <StatusBadge status={status} size="sm" interactive={false} />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-dashed border-slate-800" />
                )}
              </div>

              {/* Calorie burn footer */}
              <div className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                {log?.calories?.burned ? `${log.calories.burned} kcal` : ''}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
