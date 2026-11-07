import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { PlanDay, DayType } from '../types';

interface EditPlanDayModalProps {
  day: PlanDay;
  isOpen: boolean;
  onClose: () => void;
}

export const EditPlanDayModal: React.FC<EditPlanDayModalProps> = ({
  day,
  isOpen,
  onClose,
}) => {
  const { updatePlanDay, addCustomTaskToDay, deleteCustomTaskFromDay } = useTracker();

  const [title, setTitle] = useState(day.title);
  const [type, setType] = useState<DayType>(day.type);
  const [runningInstructions, setRunningInstructions] = useState(day.runningInstructions);
  const [gymFocus, setGymFocus] = useState(day.gymFocus);
  const [progressionRule, setProgressionRule] = useState(day.progressionRule || '');
  const [estimatedBurn, setEstimatedBurn] = useState(day.estimatedBurn);
  const [targetDurationMin, setTargetDurationMin] = useState(day.targetDurationMin);

  const [newSubtask, setNewSubtask] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlanDay(day.id, {
      title: title.trim(),
      type,
      runningInstructions: runningInstructions.trim(),
      gymFocus: gymFocus.trim(),
      progressionRule: progressionRule.trim(),
      estimatedBurn: Number(estimatedBurn) || 500,
      targetDurationMin: Number(targetDurationMin) || 60,
    });
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    addCustomTaskToDay(day.id, {
      title: newSubtask.trim(),
      category: 'workout',
    });
    setNewSubtask('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Edit Day {day.dayNumber} Program</span>
            </h3>
            <p className="text-xs text-slate-400">Modify workout, cardio targets &amp; rules</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Day Title / Focus
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Day Type
              </label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="easy">Easy (Green)</option>
                <option value="hard">Hard (Orange)</option>
                <option value="rest">Rest (Slate)</option>
                <option value="long_run">Long Run (Cyan)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Est. Burn (kcal)
              </label>
              <input
                type="number"
                value={estimatedBurn}
                onChange={(e) => setEstimatedBurn(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Running Instructions
            </label>
            <textarea
              rows={2}
              value={runningInstructions}
              onChange={(e) => setRunningInstructions(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 resize-none focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Progression Rule
            </label>
            <input
              type="text"
              value={progressionRule}
              onChange={(e) => setProgressionRule(e.target.value)}
              placeholder="e.g. Add 1 burst every loop, add 5 min every loop..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
          </div>

          {/* Subtasks list */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Default Tasks for this Day
            </span>

            <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto">
              {day.customTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="truncate pr-2">{t.title}</span>
                  <button
                    type="button"
                    onClick={() => deleteCustomTaskFromDay(day.id, t.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add new task..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
            >
              Save Day Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
