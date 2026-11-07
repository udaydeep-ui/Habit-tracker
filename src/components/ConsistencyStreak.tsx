import React from 'react';
import {
  Flame,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTracker } from '../context/TrackerContext';
import { DayTypeTag } from './DayTypeTag';

interface ConsistencyStreakProps {
  className?: string;
}

export const ConsistencyStreak: React.FC<ConsistencyStreakProps> = ({ className = '' }) => {
  const { logs, program, currentLoop, currentCycleDayNumber } = useTracker();
  const cycleLength = program.cycleLength || 9;

  // Group logs by loopNumber directly
  const loopsMap: Record<number, Record<number, string>> = {};

  Object.values(logs).forEach((log) => {
    const loop = log.loopNumber || 1;
    const day = log.cycleDayNumber;
    if (!loopsMap[loop]) loopsMap[loop] = {};
    // Keep most definitive status
    if (!loopsMap[loop][day] || log.status !== 'pending') {
      loopsMap[loop][day] = log.status;
    }
  });

  const allLoopNumbers = Object.keys(loopsMap)
    .map(Number)
    .sort((a, b) => a - b);

  let consecutiveCompletedCycles = 0;
  let maxCycleStreak = 0;
  let tempCycleStreak = 0;

  allLoopNumbers.forEach((loopNum) => {
    const daysInLoop = loopsMap[loopNum];
    let completedCount = 0;
    for (let d = 1; d <= cycleLength; d++) {
      if (daysInLoop[d] === 'completed') {
        completedCount++;
      }
    }

    const isCycleFullyComplete = completedCount === cycleLength;

    if (isCycleFullyComplete) {
      tempCycleStreak++;
      if (tempCycleStreak > maxCycleStreak) maxCycleStreak = tempCycleStreak;
    } else {
      // If loop is current loop and still in progress, streak isn't broken yet
      if (loopNum !== currentLoop) {
        tempCycleStreak = 0;
      }
    }
  });

  // Deduplicate logs into ordered sessions by loop and cycle day
  const allSessions = Object.values(logs)
    .filter((l, idx, arr) => arr.findIndex((x) => x.loopNumber === l.loopNumber && x.cycleDayNumber === l.cycleDayNumber) === idx)
    .sort((a, b) => {
      if (a.loopNumber !== b.loopNumber) return a.loopNumber - b.loopNumber;
      return a.cycleDayNumber - b.cycleDayNumber;
    });

  // Also calculate consecutive workout streak (sessions completed without fail)
  let currentDayStreak = 0;
  let bestDayStreak = 0;
  let runningDayStreak = 0;

  allSessions.forEach((session) => {
    if (session.status === 'completed') {
      runningDayStreak++;
      if (runningDayStreak > bestDayStreak) bestDayStreak = runningDayStreak;
    } else if (session.status === 'failed') {
      runningDayStreak = 0;
    }
  });

  // Backward check for current active session streak
  for (let i = allSessions.length - 1; i >= 0; i--) {
    const st = allSessions[i]?.status;
    if (st === 'completed') {
      currentDayStreak++;
    } else if (st === 'failed') {
      break;
    }
  }

  // Current active loop progress
  const currentLoopDays = loopsMap[currentLoop] || {};
  let currentLoopCompletedDays = 0;
  for (let d = 1; d <= cycleLength; d++) {
    if (currentLoopDays[d] === 'completed') {
      currentLoopCompletedDays++;
    }
  }

  const loopProgressPercent = Math.round((currentLoopCompletedDays / cycleLength) * 100);
  const consecutiveCyclesCount = Math.max(
    tempCycleStreak,
    currentLoopCompletedDays === cycleLength ? tempCycleStreak : Math.max(0, currentLoop - 1)
  );
  const bestCycleStreakCount = Math.max(consecutiveCyclesCount, maxCycleStreak, 1);

  // Trigger celebration confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f97316', '#22c55e', '#06b6d4', '#eab308'],
      });
    } catch {
      // safe fallback
    }
  };

  // Determine streak flame status & title
  const getStreakTier = (streak: number) => {
    if (streak >= 5) return { title: 'Legendary Momentum', color: 'text-rose-400', glow: 'shadow-rose-500/20' };
    if (streak >= 3) return { title: 'Unstoppable Habit', color: 'text-orange-400', glow: 'shadow-orange-500/20' };
    if (streak >= 1) return { title: 'Consistent Warrior', color: 'text-amber-400', glow: 'shadow-amber-500/20' };
    return { title: 'Loop in Progress', color: 'text-slate-400', glow: 'shadow-slate-500/10' };
  };

  const streakTier = getStreakTier(consecutiveCyclesCount);

  return (
    <div
      className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Banner: Section Header & Celebration button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/30 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-500/10">
            <Flame size={26} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white tracking-tight">Consistency Streak</h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[10px] font-mono font-bold text-orange-300">
                {streakTier.title}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Consecutive cycle completions and daily adherence streak
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={triggerCelebration}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all active:scale-95 shadow"
          title="Celebrate your consistency!"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>Celebrate Streak</span>
        </button>
      </div>

      {/* Primary Streak Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 relative z-10">
        {/* Metric 1: Current Consecutive Cycle Completions */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
              Consecutive Cycles
            </span>
            <div className="p-1 rounded-md bg-orange-500/10 text-orange-400">
              <Flame size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-orange-400">
              {consecutiveCyclesCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {consecutiveCyclesCount === 1 ? 'Cycle Completed' : 'Cycles Completed'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Loop #{currentLoop} active ({cycleLength} days / cycle)
          </div>
        </div>

        {/* Metric 2: Best Streak Record */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
              Best Streak Record
            </span>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <Trophy size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
              {bestCycleStreakCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {bestCycleStreakCount === 1 ? 'Cycle Record' : 'Cycles Record'}
            </span>
          </div>
          <div className="text-[11px] text-amber-500/80 font-mono mt-1 flex items-center gap-1">
            <Award size={12} />
            <span>All-time highest milestone</span>
          </div>
        </div>

        {/* Metric 3: Active Daily Workout Streak */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
              Daily Session Streak
            </span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <Zap size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">
              {currentDayStreak}
            </span>
            <span className="text-xs font-semibold text-slate-400">Consecutive Days</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Best daily streak: <span className="text-slate-300 font-bold">{bestDayStreak} days</span>
          </div>
        </div>

        {/* Metric 4: Current Cycle Completion Progress */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
              Loop #{currentLoop} Progress
            </span>
            <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-cyan-400">
              {loopProgressPercent}%
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {currentLoopCompletedDays} / {cycleLength} Days
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {cycleLength - currentLoopCompletedDays} sessions to close loop
          </div>
        </div>
      </div>

      {/* Interactive Visual Cycle Progress Rail (Node-by-Node) */}
      <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 sm:p-5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Loop #{currentLoop} Cycle Adherence Rail
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {currentLoopCompletedDays} of {cycleLength} Completed
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Done
            </span>
            <span className="flex items-center gap-1 text-rose-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Failed
            </span>
            <span className="flex items-center gap-1 text-amber-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Postponed
            </span>
          </div>
        </div>

        {/* 9-Node Visual Path */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {program.days.map((day) => {
            const status = currentLoopDays[day.dayNumber] || 'pending';
            const isToday = day.dayNumber === currentCycleDayNumber;

            return (
              <div
                key={day.id}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition-all ${
                  isToday
                    ? 'ring-2 ring-emerald-400 border-emerald-400 bg-slate-900 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Node number & Day pill */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[11px] font-mono font-black text-slate-300">
                    D{day.dayNumber}
                  </span>
                  <DayTypeTag type={day.type} size="sm" />
                </div>

                {/* Node Status Symbol */}
                <div className="my-2">
                  {status === 'completed' ? (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 flex items-center justify-center font-black text-sm shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                      ✓
                    </div>
                  ) : status === 'failed' ? (
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/60 text-rose-400 flex items-center justify-center font-black text-sm shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                      ✗
                    </div>
                  ) : status === 'postponed_cancelled' ? (
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/60 text-amber-400 flex items-center justify-center font-black text-sm shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                      −
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-500 flex items-center justify-center text-xs font-mono">
                      ○
                    </div>
                  )}
                </div>

                {/* Title */}
                <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                  {day.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
