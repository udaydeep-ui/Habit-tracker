import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Bell, CheckCircle, Award, Sparkles, Filter } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { StatusBadge, StatusQuickPicker } from './StatusBadge';
import { Habit, TaskStatus } from '../types';

export const HabitsTracker: React.FC = () => {
  const {
    habits,
    logs,
    selectedDate,
    setSelectedDate,
    setHabitStatus,
    cycleHabitStatus,
    addHabit,
    updateHabit,
    deleteHabit,
  } = useTracker();

  // Generate last 7 dates array for the adherence grid
  const getLast7Days = () => {
    const list: string[] = [];
    const today = new Date(selectedDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      list.push(d.toISOString().split('T')[0]);
    }
    return list;
  };

  const dates7 = getLast7Days();

  // Modal / Form state for Add / Edit habit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Habit['category']>('custom');
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState('✨');
  const [reminderTime, setReminderTime] = useState('08:00');

  const openAddModal = () => {
    setEditingHabitId(null);
    setTitle('');
    setCategory('custom');
    setFrequency('daily');
    setTarget('');
    setIcon('✨');
    setReminderTime('08:00');
    setIsModalOpen(true);
  };

  const openEditModal = (h: Habit) => {
    setEditingHabitId(h.id);
    setTitle(h.title);
    setCategory(h.category);
    setFrequency(h.frequency);
    setTarget(h.target || '');
    setIcon(h.icon || '✨');
    setReminderTime(h.reminderTime || '08:00');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingHabitId) {
      updateHabit(editingHabitId, {
        title: title.trim(),
        category,
        frequency,
        target: target.trim() || undefined,
        icon,
        reminderTime,
      });
    } else {
      addHabit({
        title: title.trim(),
        category,
        frequency,
        target: target.trim() || undefined,
        icon,
        reminderTime,
      });
    }
    setIsModalOpen(false);
  };

  // Calculate habit streak for a habit
  const calculateStreak = (habitId: string) => {
    const sortedDates = Object.keys(logs).sort().reverse();
    let streak = 0;
    for (const d of sortedDates) {
      const st = logs[d]?.habitsStatus?.[habitId];
      if (st === 'completed') {
        streak++;
      } else if (st === 'failed') {
        break;
      }
      // Postponed/pending doesn't immediately break streak if it's today
    }
    return streak;
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles size={18} />
            </span>
            <h2 className="text-xl font-black text-white">Daily Habits & Micro-Routines</h2>
          </div>
          <p className="text-xs text-slate-400">
            Adherence matrix: Tick (✓ Completed), Cross (✗ Failed), Yellow Minus (− Postponed)
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Custom Habit</span>
        </button>
      </div>

      {/* Habits 7-Day Adherence Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[220px]">Habit & Goal</th>
                <th className="py-3 px-2 text-center w-20">Frequency</th>
                <th className="py-3 px-2 text-center w-16">Streak</th>
                {dates7.map((dateStr) => {
                  const dObj = new Date(dateStr);
                  const isCurrent = dateStr === selectedDate;
                  const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = dObj.getDate();

                  return (
                    <th
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`py-3 px-2 text-center min-w-[54px] cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-slate-800/80 text-emerald-400 font-black border-x border-slate-700'
                          : 'hover:bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      <div>{dayName}</div>
                      <div className="text-[10px] opacity-75">{dayNum}</div>
                    </th>
                  );
                })}
                <th className="py-3 px-3 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {habits.map((h) => {
                const streak = calculateStreak(h.id);

                return (
                  <tr key={h.id} className="hover:bg-slate-800/20 transition-colors">
                    {/* Habit Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl select-none">{h.icon || '✨'}</span>
                        <div>
                          <div className="font-bold text-slate-200 text-sm">{h.title}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            {h.target && <span className="font-mono text-slate-300">{h.target}</span>}
                            {h.reminderTime && (
                              <span className="flex items-center gap-0.5 text-slate-500 font-mono text-[10px]">
                                <Bell size={10} />
                                {h.reminderTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Frequency */}
                    <td className="py-3 px-2 text-center">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize">
                        {h.frequency.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-2 text-center">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-xs text-amber-400">
                        <Award size={13} />
                        <span>{streak}d</span>
                      </div>
                    </td>

                    {/* 7 Days Grid Cells */}
                    {dates7.map((dateStr) => {
                      const logForDay = logs[dateStr];
                      const status: TaskStatus = logForDay?.habitsStatus?.[h.id] || 'pending';
                      const isSelected = dateStr === selectedDate;

                      return (
                        <td
                          key={dateStr}
                          className={`py-2 px-1 text-center ${
                            isSelected ? 'bg-slate-800/30 border-x border-slate-700/60' : ''
                          }`}
                        >
                          <div className="flex justify-center">
                            <StatusBadge
                              status={status}
                              size="sm"
                              onClick={() => cycleHabitStatus(dateStr, h.id)}
                            />
                          </div>
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(h)}
                          className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                          title="Edit habit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHabit(h.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                          title="Delete habit"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Day Quick Checkoff Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="font-bold text-slate-200 text-sm mb-3 flex items-center justify-between">
          <span>Quick Log Habits for Selected Date ({selectedDate})</span>
          <span className="text-xs font-mono text-slate-500">1-Tap Fast Toggle</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {habits.map((h) => {
            const currentStatus = logs[selectedDate]?.habitsStatus?.[h.id] || 'pending';

            return (
              <div
                key={h.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{h.icon || '✨'}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block truncate">{h.title}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{h.target || h.frequency}</span>
                  </div>
                </div>

                <StatusQuickPicker
                  currentStatus={currentStatus}
                  onChange={(st) => setHabitStatus(selectedDate, h.id, st)}
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-white mb-4">
              {editingHabitId ? 'Edit Habit' : 'Create Custom Habit'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cold Shower, Creatine 5g, 10k Steps"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Emoji / Icon
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Target Goal
                  </label>
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. 3,000 ml or 10 min"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                  >
                    <option value="hydration">Hydration</option>
                    <option value="supplements">Supplements</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="sleep">Sleep</option>
                    <option value="mobility">Mobility</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e: any) => setFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                  >
                    <option value="daily">Daily</option>
                    <option value="workout_days">Workout Days Only</option>
                    <option value="rest_days">Rest Days Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Daily Reminder Time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                >
                  {editingHabitId ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
