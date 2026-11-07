import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Check,
  X,
  Minus,
  Calendar,
  Sparkles,
  Bell,
  FileText,
  BarChart3,
  Dumbbell,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Image as ImageIcon,
  ChevronRight,
} from 'lucide-react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { CycleStrip } from './components/CycleStrip';
import { DailyLogFeed } from './components/DailyLogFeed';
import { HabitsTracker } from './components/HabitsTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CalendarMatrix } from './components/CalendarMatrix';
import { ExportReports } from './components/ExportReports';
import { PlanReferenceModal } from './components/PlanReferenceModal';
import { ReminderSettingsModal } from './components/ReminderSettingsModal';
import { EditPlanDayModal } from './components/EditPlanDayModal';

function MainAppContent() {
  const {
    program,
    selectedDate,
    setSelectedDate,
    todayDate,
    currentLoop,
    currentCycleDayNumber,
    resetToDefaultPlan,
  } = useTracker();

  // Tab state
  const [activeTab, setActiveTab] = useState<'feed' | 'habits' | 'analytics' | 'calendar' | 'reports'>('feed');

  // Modal states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isEditDayModalOpen, setIsEditDayModalOpen] = useState(false);

  const activePlanDay = program.days.find((d) => d.dayNumber === currentCycleDayNumber) || program.days[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Cycle Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity size={20} className="text-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  CycleSync
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  9-DAY ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gym &amp; Running Loop Tracker &bull; Loop #{currentLoop} &bull; Day {currentCycleDayNumber}
              </p>
            </div>
          </div>

          {/* Quick Status Legend and Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Quick status key */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span>✓</span> Completed
              </span>
              <span className="text-slate-700">&bull;</span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span>✗</span> Failed
              </span>
              <span className="text-slate-700">&bull;</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <span>−</span> Postponed
              </span>
            </div>

            {/* Jump to Today Button */}
            <button
              type="button"
              onClick={() => setSelectedDate(todayDate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedDate === todayDate
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              Today ({todayDate.slice(5)})
            </button>

            {/* Edit Day Program */}
            <button
              type="button"
              onClick={() => setIsEditDayModalOpen(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="Edit Day Tasks & Rules"
            >
              <Sliders size={16} />
            </button>

            {/* Reminders Modal */}
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="Reminder Settings"
            >
              <Bell size={16} />
            </button>

            {/* View Original Plan Image / AI Scan */}
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-cyan-500/30 shadow-md transition-all active:scale-95"
            >
              <ImageIcon size={14} />
              <span>Plan Photo &amp; AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* 9-Day Interactive Cycle Rail */}
        <CycleStrip />

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 border-b border-slate-800/90 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'feed'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={16} />
            <span>Today &amp; Log Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'habits'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>Habits &amp; Tasks Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 size={16} />
            <span>Data Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar size={16} />
            <span>30-Day Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={16} />
            <span>Export Reports</span>
          </button>
        </div>

        {/* Active Tab Content */}
        {activeTab === 'feed' && <DailyLogFeed />}
        {activeTab === 'habits' && <HabitsTracker />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'calendar' && <CalendarMatrix />}
        {activeTab === 'reports' && <ExportReports />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>CycleSync &bull; 9-Day Running &amp; Gym Plan</span>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => setIsPlanModalOpen(true)}
            className="hover:text-slate-300 underline"
          >
            Program Rules &amp; Photo
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset to standard 9-day plan blueprint?')) {
                resetToDefaultPlan();
              }
            }}
            className="hover:text-amber-400"
          >
            Reset Plan Default
          </button>
        </div>
      </footer>

      {/* Modals */}
      <PlanReferenceModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />

      <ReminderSettingsModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />

      {activePlanDay && (
        <EditPlanDayModal
          day={activePlanDay}
          isOpen={isEditDayModalOpen}
          onClose={() => setIsEditDayModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <TrackerProvider>
      <MainAppContent />
    </TrackerProvider>
  );
}
