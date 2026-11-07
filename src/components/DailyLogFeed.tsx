import React, { useState } from 'react';
import {
  Flame,
  Utensils,
  Dumbbell,
  Activity,
  Plus,
  Trash2,
  Trophy,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { StatusQuickPicker } from './StatusBadge';
import { DayTypeTag } from './DayTypeTag';
import { IntervalTimer } from './IntervalTimer';

export const DailyLogFeed: React.FC = () => {
  const {
    program,
    activeLoop,
    activeCycleDayNumber,
    getActiveLog,
    setCycleDayStatus,
    setCycleSubtaskStatus,
    updateActiveLog,
    updateActiveCalories,
    updateActiveProgressions,
    updateActiveDayWorks,
    advanceToNextDay,
    goToPreviousDay,
    advanceToNextLoop,
    addCustomTaskToDay,
    deleteCustomTaskFromDay,
  } = useTracker();

  const log = getActiveLog();
  const currentDay = program.days.find((d) => d.dayNumber === activeCycleDayNumber) || program.days[0];
  const cycleLength = program.cycleLength || 9;

  // Local states for quick adding tasks & strength exercises
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'workout' | 'cardio' | 'nutrition' | 'recovery'>('workout');
  const [showAddTask, setShowAddTask] = useState(false);

  const [newExerciseName, setNewExerciseName] = useState('');
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseWeight, setExerciseWeight] = useState(80);
  const [exerciseReps, setExerciseReps] = useState(8);

  // Calorie calculations
  const consumed = log.calories?.consumed || 0;
  const burned = log.calories?.burned || 0;
  const netCalories = consumed - burned;

  // Progression note calculated dynamically from activeLoop
  const getLoopProgressionTarget = () => {
    if (currentDay.dayNumber === 4) {
      const bursts = 5 + (activeLoop - 1);
      return `Loop #${activeLoop} Target: ${bursts} fast bursts (30–45 sec each) with 2 min walk between.`;
    }
    if (currentDay.dayNumber === 6) {
      const runTime = Math.min(60, 20 + (activeLoop - 1) * 5);
      return `Loop #${activeLoop} Target: ${runTime} min steady running capped strictly at 7 km/h.`;
    }
    if (currentDay.dayNumber === 5) {
      return `Run-walk 2 min / 1 min × 6 + 4 strides (15s fast, walk back × 4).`;
    }
    return currentDay.progressionRule || 'Follow standard cycle intensity.';
  };

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) return;
    const currentExercises = log.progressions?.strengthExercises || [];
    const newEx = {
      id: `ex-${Date.now()}`,
      name: newExerciseName.trim(),
      sets: [{ weightKg: Number(exerciseWeight) || 0, reps: Number(exerciseReps) || 0, rpe: 8 }],
      notes: '',
      isPR: false,
    };
    updateActiveProgressions({
      strengthExercises: [...currentExercises, newEx],
    });
    setNewExerciseName('');
    setShowAddExercise(false);
  };

  const handleAddSet = (exerciseId: string) => {
    const currentExercises = log.progressions?.strengthExercises || [];
    const updated = currentExercises.map((ex) => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1] || { weightKg: 80, reps: 8, rpe: 8 };
        return {
          ...ex,
          sets: [...ex.sets, { ...lastSet }],
        };
      }
      return ex;
    });
    updateActiveProgressions({ strengthExercises: updated });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const currentExercises = log.progressions?.strengthExercises || [];
    updateActiveProgressions({
      strengthExercises: currentExercises.filter((e) => e.id !== exerciseId),
    });
  };

  const handleTogglePR = (exerciseId: string) => {
    const currentExercises = log.progressions?.strengthExercises || [];
    const updated = currentExercises.map((e) => (e.id === exerciseId ? { ...e, isPR: !e.isPR } : e));
    updateActiveProgressions({ strengthExercises: updated });
  };

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addCustomTaskToDay(currentDay.id, {
      title: newTaskTitle.trim(),
      category: newTaskCategory,
    });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Day Focus & Status Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow according to day type */}
        <div
          className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            currentDay.type === 'easy'
              ? 'bg-emerald-500'
              : currentDay.type === 'hard'
              ? 'bg-orange-500'
              : currentDay.type === 'long_run'
              ? 'bg-cyan-500'
              : 'bg-slate-400'
          }`}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-black">
                LOOP #{activeLoop}
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300">
                DAY {currentDay.dayNumber} OF {cycleLength}
              </span>

              <DayTypeTag type={currentDay.type} size="md" />

              {/* Date stamp field for when this session is performed */}
              <div className="flex items-center gap-1.5 ml-1 text-xs text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <Calendar size={13} className="text-slate-400" />
                <span className="text-[11px] text-slate-500">Performed on:</span>
                <input
                  type="date"
                  value={log.date || ''}
                  onChange={(e) => updateActiveLog({ date: e.target.value })}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{currentDay.title}</span>
            </h2>

            <p className="text-sm text-slate-300 mt-1 max-w-2xl font-medium">
              {currentDay.runningInstructions}
            </p>

            {/* Loop Progression Callout */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <Trophy size={14} className="shrink-0 text-amber-400" />
              <span>{getLoopProgressionTarget()}</span>
            </div>
          </div>

          {/* Quick Status Control and Navigation */}
          <div className="flex flex-col items-start lg:items-end gap-2.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/90">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Session Status
            </span>
            <StatusQuickPicker
              currentStatus={log.status}
              onChange={(newStatus) => setCycleDayStatus(activeLoop, activeCycleDayNumber, newStatus)}
              size="md"
            />

            {/* Quick Session Stepper */}
            <div className="flex items-center gap-1.5 w-full pt-1.5 border-t border-slate-800">
              <button
                type="button"
                onClick={goToPreviousDay}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold font-mono flex items-center justify-center gap-1 border border-slate-800"
              >
                <ChevronLeft size={14} />
                <span>Prev Day</span>
              </button>

              {activeCycleDayNumber < cycleLength ? (
                <button
                  type="button"
                  onClick={advanceToNextDay}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold font-mono flex items-center justify-center gap-1 border border-emerald-500/30"
                >
                  <span>Next Day</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={advanceToNextLoop}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-black font-mono flex items-center justify-center gap-1 shadow-lg shadow-amber-500/20"
                  title="Loop 9-Day circle completed! Start next loop."
                >
                  <RotateCw size={12} />
                  <span>Loop #{activeLoop + 1}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Run/Walk Interval Timer (for cardio days) */}
      {currentDay.type !== 'rest' && (
        <IntervalTimer
          dayNumber={currentDay.dayNumber}
          loopNumber={activeLoop}
          onFinish={() => {
            setCycleDayStatus(activeLoop, activeCycleDayNumber, 'completed');
          }}
        />
      )}

      {/* Dual Column: Calorie Feed + Progression & Works Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Calorie & Nutrition Feed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Flame size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Calorie &amp; Macro Feed</h3>
                <p className="text-xs text-slate-400">Energy balance for Loop #{activeLoop} Day {activeCycleDayNumber}</p>
              </div>
            </div>

            {/* Net Calorie Pill */}
            <div
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border ${
                netCalories > 0
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <span>Net: {netCalories > 0 ? `+${netCalories}` : netCalories} kcal</span>
            </div>
          </div>

          {/* Calorie Inputs Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Utensils size={14} className="text-amber-400" />
                <span>Consumed (kcal)</span>
              </label>
              <input
                type="number"
                min={0}
                max={10000}
                step={50}
                value={log.calories?.consumed ?? ''}
                onChange={(e) => updateActiveCalories({ consumed: Number(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-lg font-mono font-bold text-slate-100 focus:outline-none focus:border-amber-400"
                placeholder="2500"
              />
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Flame size={14} className="text-orange-400" />
                <span>Burned (kcal)</span>
              </label>
              <input
                type="number"
                min={0}
                max={10000}
                step={50}
                value={log.calories?.burned ?? ''}
                onChange={(e) => updateActiveCalories({ burned: Number(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-lg font-mono font-bold text-slate-100 focus:outline-none focus:border-orange-400"
                placeholder="550"
              />
            </div>
          </div>

          {/* Macros Breakdown */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Macronutrients
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">🥩 Protein (g)</label>
                <input
                  type="number"
                  min={0}
                  value={log.calories?.proteinGrams ?? ''}
                  onChange={(e) => updateActiveCalories({ proteinGrams: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm font-mono text-slate-200"
                  placeholder="140"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">🍚 Carbs (g)</label>
                <input
                  type="number"
                  min={0}
                  value={log.calories?.carbsGrams ?? ''}
                  onChange={(e) => updateActiveCalories({ carbsGrams: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm font-mono text-slate-200"
                  placeholder="280"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">🥑 Fats (g)</label>
                <input
                  type="number"
                  min={0}
                  value={log.calories?.fatGrams ?? ''}
                  onChange={(e) => updateActiveCalories({ fatGrams: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm font-mono text-slate-200"
                  placeholder="65"
                />
              </div>
            </div>
          </div>

          {/* Day Works & Recovery Notes */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Execution &amp; Recovery Works
            </span>

            {/* Checklists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={log.dayWorks?.warmupCompleted || false}
                  onChange={(e) => updateActiveDayWorks({ warmupCompleted: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-medium">Warm-up &amp; Drills Done</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={log.dayWorks?.breathingCheck || false}
                  onChange={(e) => updateActiveDayWorks({ breathingCheck: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-medium">Belly Breaths (In 3, Out 2)</span>
              </label>
            </div>

            {/* Feeling Selector */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Physical Feeling / Energy:</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['energized', 'good', 'tired', 'sore', 'exhausted'] as const).map((feel) => (
                  <button
                    key={feel}
                    type="button"
                    onClick={() => updateActiveDayWorks({ feeling: feel })}
                    className={`py-1.5 px-1 rounded-lg text-xs font-semibold capitalize transition-all border ${
                      log.dayWorks?.feeling === feel
                        ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {feel}
                  </button>
                ))}
              </div>
            </div>

            {/* Workout Notes */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Daily Works &amp; Session Notes:</label>
              <textarea
                rows={2}
                value={log.dayWorks?.workoutNotes || ''}
                onChange={(e) => updateActiveDayWorks({ workoutNotes: e.target.value })}
                placeholder="Log how your cadence felt, pacing observations, or gym lifts..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 resize-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Running & Strength Progressions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Progressions Tracker</h3>
                <p className="text-xs text-slate-400">Cardio pacing &amp; gym strength overload</p>
              </div>
            </div>

            {/* Body weight quick feed */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400">Weight:</span>
              <input
                type="number"
                step={0.1}
                value={log.progressions?.bodyWeightKg ?? ''}
                onChange={(e) =>
                  updateActiveProgressions({ bodyWeightKg: Number(e.target.value) || undefined })
                }
                className="w-14 bg-transparent text-xs font-mono font-bold text-slate-200 focus:outline-none"
                placeholder="74.0"
              />
              <span className="text-[10px] text-slate-500 font-mono">kg</span>
            </div>
          </div>

          {/* Running Metrics Grid */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Running / Cardio Output
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Distance (km)</label>
                <input
                  type="number"
                  step={0.1}
                  value={log.progressions?.runningDistanceKm ?? ''}
                  onChange={(e) =>
                    updateActiveProgressions({ runningDistanceKm: Number(e.target.value) || undefined })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  placeholder="3.5"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Time (mins)</label>
                <input
                  type="number"
                  value={log.progressions?.runningDurationMin ?? ''}
                  onChange={(e) =>
                    updateActiveProgressions({ runningDurationMin: Number(e.target.value) || undefined })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Speed (km/h)</label>
                <input
                  type="number"
                  step={0.1}
                  value={log.progressions?.runningSpeedKmh ?? ''}
                  onChange={(e) =>
                    updateActiveProgressions({ runningSpeedKmh: Number(e.target.value) || undefined })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  placeholder="6.8"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">RPE (1–10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={log.progressions?.rpeScore ?? ''}
                  onChange={(e) =>
                    updateActiveProgressions({ rpeScore: Number(e.target.value) || undefined })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  placeholder="7"
                />
              </div>
            </div>
          </div>

          {/* Strength Exercises Overload Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell size={14} className="text-emerald-400" />
                <span>Strength Overload Log</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddExercise(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Exercise</span>
              </button>
            </div>

            {/* Exercise list */}
            {log.progressions?.strengthExercises && log.progressions.strengthExercises.length > 0 ? (
              <div className="space-y-2.5">
                {log.progressions.strengthExercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200">{ex.name}</span>
                        {ex.isPR && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                            PR
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePR(ex.id)}
                          className={`p-1 rounded hover:bg-slate-800 ${
                            ex.isPR ? 'text-amber-400' : 'text-slate-500'
                          }`}
                          title="Toggle PR badge"
                        >
                          <Trophy size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(ex.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                          title="Remove exercise"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Sets row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {ex.sets.map((set, sIdx) => (
                        <div
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5"
                        >
                          <span className="text-slate-500 text-[10px]">#{sIdx + 1}</span>
                          <span className="font-bold text-slate-200">{set.weightKg}kg</span>
                          <span className="text-slate-500">×</span>
                          <span className="font-bold text-slate-200">{set.reps}</span>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddSet(ex.id)}
                        className="px-2 py-1 rounded-lg border border-dashed border-slate-700 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-500"
                      >
                        + Set
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No strength sets logged yet for this session. Click &quot;Add Exercise&quot; to log your bench, squats, or rows.
              </div>
            )}

            {/* Modal/Inline Add Exercise form */}
            {showAddExercise && (
              <div className="mt-3 p-3 bg-slate-950 border border-slate-700 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Add Exercise to Session</span>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="e.g. Bench Press, Squat, Lat Pulldown"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block">Weight (kg)</label>
                    <input
                      type="number"
                      value={exerciseWeight}
                      onChange={(e) => setExerciseWeight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block">Reps</label>
                    <input
                      type="number"
                      value={exerciseReps}
                      onChange={(e) => setExerciseReps(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="self-end px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddExercise(false)}
                    className="self-end px-2 py-1.5 rounded text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Programmed Day Tasks & Custom Tasks */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              Tasks &amp; Sub-Routines for Day {currentDay.dayNumber}
            </h3>
            <p className="text-xs text-slate-400">
              Check off tasks with Tick (✓), Cross (✗), or Yellow Minus (−)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddTask(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
          >
            <Plus size={14} />
            <span>Add Custom Task</span>
          </button>
        </div>

        {/* Tasks list */}
        <div className="space-y-2">
          {currentDay.customTasks.map((task) => {
            const taskStatus = log.tasksStatus[task.id] || 'pending';

            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-200">{task.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      {task.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusQuickPicker
                    currentStatus={taskStatus}
                    onChange={(st) => setCycleSubtaskStatus(activeLoop, activeCycleDayNumber, task.id, st)}
                    size="sm"
                  />
                  <button
                    type="button"
                    onClick={() => deleteCustomTaskFromDay(currentDay.id, task.id)}
                    className="p-1.5 rounded text-slate-600 hover:text-rose-400 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal / inline add task */}
        {showAddTask && (
          <form onSubmit={handleCreateSubtask} className="mt-4 p-4 bg-slate-950 border border-slate-700 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Add Task to Day {currentDay.dayNumber}</span>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. 10 min incline walk, Foam roll quads, Take electrolytes"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <select
                value={newTaskCategory}
                onChange={(e: any) => setNewTaskCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="workout">Workout</option>
                <option value="cardio">Cardio</option>
                <option value="recovery">Recovery</option>
                <option value="nutrition">Nutrition</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
