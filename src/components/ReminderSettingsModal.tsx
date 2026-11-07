import React, { useState } from 'react';
import { X, Bell, Volume2, Clock, Check, Sparkles } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { reminderConfig, setReminderConfig, playAudioChime, program } = useTracker();

  const [enabled, setEnabled] = useState(reminderConfig.enabled);
  const [time, setTime] = useState(reminderConfig.time);
  const [soundEnabled, setSoundEnabled] = useState(reminderConfig.soundEnabled);
  const [customMessage, setCustomMessage] = useState(reminderConfig.customMessage);
  const [testTriggered, setTestTriggered] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setReminderConfig({
      enabled,
      time,
      soundEnabled,
      customMessage,
    });
    onClose();
  };

  const handleTestReminder = () => {
    playAudioChime('success');
    setTestTriggered(true);
    setTimeout(() => setTestTriggered(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Daily Workout Reminders</h3>
              <p className="text-xs text-slate-400">Synced to your 9-day training cycle</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {testTriggered && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <Bell size={14} className="text-emerald-400 animate-bounce" />
            <span>Reminder Alert: &quot;{customMessage}&quot;</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-sm font-bold text-slate-200 block">Enable Daily Reminders</span>
              <span className="text-xs text-slate-400">Alerts for today&apos;s cycle workout</span>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Clock size={13} className="text-cyan-400" />
              <span>Reminder Time</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-sm font-bold text-slate-200 block">Sound &amp; Chime Effects</span>
              <span className="text-xs text-slate-400">Audio feedback on completion &amp; intervals</span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Custom Reminder Message
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Time for your 9-Day cycle routine! Check today's target."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={handleTestReminder}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 border border-slate-700"
            >
              <Volume2 size={14} />
              <span>Test Chime</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
