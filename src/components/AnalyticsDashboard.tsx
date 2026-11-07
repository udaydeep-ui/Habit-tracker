import React, { useState } from 'react';
import {
  Flame,
  Activity,
  CheckCircle2,
  XCircle,
  MinusCircle,
  TrendingUp,
  Award,
  Zap,
  Dumbbell,
  Calendar,
  Trophy,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { ConsistencyStreak } from './ConsistencyStreak';
import { DayEntryLog, StrengthExercise, StrengthSet } from '../types';

export const AnalyticsDashboard: React.FC = () => {
  const { logs, program, currentLoop } = useTracker();
  const [activeMetricTab, setActiveMetricTab] = useState<'calories' | 'running' | 'status'>('calories');

  // Deduplicate unique cycle logs across loops and days
  const uniqueLogsMap = new Map<string, DayEntryLog>();
  Object.values(logs).forEach((l) => {
    const key = `L${l.loopNumber}-D${l.cycleDayNumber}`;
    if (!uniqueLogsMap.has(key) || l.status !== 'pending') {
      uniqueLogsMap.set(key, l);
    }
  });
  const uniqueLogs = Array.from(uniqueLogsMap.values()).sort((a, b) => {
    if (a.loopNumber !== b.loopNumber) return a.loopNumber - b.loopNumber;
    return a.cycleDayNumber - b.cycleDayNumber;
  });

  // Metrics aggregations
  let totalCompleted = 0;
  let totalFailed = 0;
  let totalPostponed = 0;
  let totalCaloriesBurned = 0;
  let totalCaloriesConsumed = 0;
  let totalRunKm = 0;
  let prList: { exercise: string; weight: number; reps: number; date: string }[] = [];

  uniqueLogs.forEach((l) => {
    if (l.status === 'completed') totalCompleted++;
    if (l.status === 'failed') totalFailed++;
    if (l.status === 'postponed_cancelled') totalPostponed++;

    totalCaloriesBurned += l.calories?.burned || 0;
    totalCaloriesConsumed += l.calories?.consumed || 0;
    totalRunKm += l.progressions?.runningDistanceKm || 0;

    l.progressions?.strengthExercises?.forEach((ex: StrengthExercise) => {
      if (ex.isPR && ex.sets.length > 0) {
        const topSet = ex.sets.reduce((max: StrengthSet, s: StrengthSet) => (s.weightKg > max.weightKg ? s : max), ex.sets[0]);
        prList.push({
          exercise: ex.name,
          weight: topSet.weightKg,
          reps: topSet.reps,
          date: l.date || `L${l.loopNumber} D${l.cycleDayNumber}`,
        });
      }
    });
  });

  const totalLoggedSessions = uniqueLogs.filter((l) => l.status !== 'pending').length || 1;
  const adherenceRate = Math.round((totalCompleted / Math.max(1, totalCompleted + totalFailed + totalPostponed)) * 100) || 0;
  const avgBurnedPerDay = Math.round(totalCaloriesBurned / totalLoggedSessions);
  const avgConsumedPerDay = Math.round(totalCaloriesConsumed / totalLoggedSessions);
  const avgNetBalance = avgConsumedPerDay - avgBurnedPerDay;

  // Recent 10 sessions for chart
  const recentLogs = uniqueLogs.slice(-10);
  const maxCal = Math.max(
    3000,
    ...recentLogs.map((l) => Math.max(l.calories?.consumed || 0, l.calories?.burned || 0))
  );

  return (
    <div className="space-y-6">
      {/* Consistency Streak Visual Component */}
      <ConsistencyStreak />

      {/* Top Athletic Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Adherence Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Adherence Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-black text-slate-100 mb-1">
            {adherenceRate}%
          </div>
          <div className="text-xs text-slate-400 font-medium">
            <span className="text-emerald-400 font-bold">{totalCompleted} ✓</span> completed /{' '}
            <span className="text-rose-400 font-bold">{totalFailed} ✗</span> failed /{' '}
            <span className="text-amber-400 font-bold">{totalPostponed} −</span> postponed
          </div>
        </div>

        {/* Total Calories Burned */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Total Burned</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Flame size={16} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-black text-slate-100 mb-1">
            {totalCaloriesBurned.toLocaleString()} <span className="text-sm font-sans text-slate-400">kcal</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Avg <span className="font-mono text-slate-200 font-bold">{avgBurnedPerDay}</span> kcal / day
          </div>
        </div>

        {/* Running Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Distance Logged</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-black text-slate-100 mb-1">
            {totalRunKm.toFixed(1)} <span className="text-sm font-sans text-slate-400">km</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Cycle Loop <span className="font-mono text-cyan-400 font-bold">#{currentLoop}</span> in progress
          </div>
        </div>

        {/* Net Energy Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Net Calorie Avg</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div
            className={`text-3xl sm:text-4xl font-mono font-black mb-1 ${
              avgNetBalance > 0 ? 'text-blue-400' : 'text-emerald-400'
            }`}
          >
            {avgNetBalance > 0 ? `+${avgNetBalance}` : avgNetBalance}{' '}
            <span className="text-sm font-sans text-slate-400">kcal</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {avgNetBalance > 0 ? 'Slight surplus (muscle fueling)' : 'Deficit (conditioning cut)'}
          </div>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Energy & Progression Analytics</span>
            </h3>
            <p className="text-xs text-slate-400">Visual breakdown across past logged dates</p>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveMetricTab('calories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetricTab === 'calories'
                  ? 'bg-slate-800 text-amber-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calorie Burn vs Intake
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab('running')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetricTab === 'running'
                  ? 'bg-slate-800 text-cyan-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Running Volume
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab('status')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetricTab === 'status'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Status Proportions
            </button>
          </div>
        </div>

        {/* TAB 1: Calorie Burn vs Consumed Chart */}
        {activeMetricTab === 'calories' && (
          <div>
            <div className="flex items-center gap-4 text-xs font-mono mb-4 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span>Intake (kcal)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-500 inline-block" />
                <span>Burned (kcal)</span>
              </div>
            </div>

            <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 border-b border-slate-800 pb-2">
              {recentLogs.map((l) => {
                const cBurn = l.calories?.burned || 0;
                const cConsume = l.calories?.consumed || 0;
                const burnHeight = Math.min(100, Math.round((cBurn / maxCal) * 100));
                const consumeHeight = Math.min(100, Math.round((cConsume / maxCal) * 100));
                const label = `L${l.loopNumber}D${l.cycleDayNumber}`;

                return (
                  <div key={l.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end gap-1 w-full justify-center h-full">
                      {/* Intake Bar */}
                      <div
                        className="w-1/2 max-w-[18px] bg-amber-500/80 group-hover:bg-amber-400 rounded-t-sm transition-all"
                        style={{ height: `${consumeHeight}%` }}
                        title={`Loop ${l.loopNumber} Day ${l.cycleDayNumber}: Consumed ${cConsume} kcal`}
                      />
                      {/* Burn Bar */}
                      <div
                        className="w-1/2 max-w-[18px] bg-orange-500/80 group-hover:bg-orange-400 rounded-t-sm transition-all"
                        style={{ height: `${burnHeight}%` }}
                        title={`Loop ${l.loopNumber} Day ${l.cycleDayNumber}: Burned ${cBurn} kcal`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-[42px] font-bold">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Running Volume Chart */}
        {activeMetricTab === 'running' && (
          <div>
            <div className="flex items-center gap-4 text-xs font-mono mb-4 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-cyan-500 inline-block" />
                <span>Distance (km)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-500 inline-block" />
                <span>Duration (min)</span>
              </div>
            </div>

            <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 border-b border-slate-800 pb-2">
              {recentLogs.map((l) => {
                const km = l.progressions?.runningDistanceKm || 0;
                const mins = l.progressions?.runningDurationMin || 0;
                const kmHeight = Math.min(100, Math.round((km / 10) * 100));
                const label = `L${l.loopNumber}D${l.cycleDayNumber}`;

                return (
                  <div key={l.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex justify-center items-end h-full">
                      <div
                        className="w-full max-w-[28px] bg-cyan-500/80 group-hover:bg-cyan-400 rounded-t-sm transition-all flex items-center justify-center text-[10px] font-mono font-bold text-slate-950"
                        style={{ height: `${Math.max(10, kmHeight)}%` }}
                        title={`Loop ${l.loopNumber} Day ${l.cycleDayNumber}: ${km} km (${mins} min)`}
                      >
                        {km > 0 ? `${km}k` : ''}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-[42px] font-bold">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Status Proportions */}
        {activeMetricTab === 'status' && (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-2xl">
                  ✓
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-slate-100">{totalCompleted}</div>
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Completed Sessions
                  </div>
                </div>
              </div>

              <div className="bg-rose-950/30 border border-rose-500/40 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-2xl">
                  ✗
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-slate-100">{totalFailed}</div>
                  <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                    Failed Sessions
                  </div>
                </div>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-2xl">
                  −
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-slate-100">{totalPostponed}</div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Postponed / Cancelled
                  </div>
                </div>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="mt-6">
              <div className="text-xs font-mono text-slate-400 mb-2">Overall Cycle Distribution</div>
              <div className="h-4 rounded-full overflow-hidden flex w-full bg-slate-950 border border-slate-800">
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(totalCompleted / totalLoggedSessions) * 100}%` }}
                  title={`Completed: ${totalCompleted}`}
                />
                <div
                  className="bg-rose-500 transition-all"
                  style={{ width: `${(totalFailed / totalLoggedSessions) * 100}%` }}
                  title={`Failed: ${totalFailed}`}
                />
                <div
                  className="bg-amber-400 transition-all"
                  style={{ width: `${(totalPostponed / totalLoggedSessions) * 100}%` }}
                  title={`Postponed: ${totalPostponed}`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PR Accomplishments Log */}
      {prList.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy size={18} />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">Personal Records (PRs) Logged</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {prList.map((pr, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200 text-xs">{pr.exercise}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{pr.date}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-black text-amber-400">{pr.weight} kg</span>
                  <span className="text-xs text-slate-400 font-mono"> × {pr.reps}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
