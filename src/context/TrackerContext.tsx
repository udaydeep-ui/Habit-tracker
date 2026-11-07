import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PlanProgram,
  PlanDay,
  Habit,
  DayEntryLog,
  TaskStatus,
  CustomTask,
  DayCalories,
  DayProgressions,
  DayWorks,
  ReminderConfig,
} from '../types';
import { DEFAULT_PLAN_PROGRAM, DEFAULT_HABITS, generateInitialLogs } from '../data/defaultPlan';

interface TrackerContextType {
  program: PlanProgram;
  habits: Habit[];
  logs: Record<string, DayEntryLog>;
  selectedDate: string;
  todayDate: string;
  currentLoop: number;
  currentCycleDayNumber: number;
  reminderConfig: ReminderConfig;
  setSelectedDate: (date: string) => void;
  setDayStatus: (date: string, status: TaskStatus) => void;
  cycleDayStatus: (date: string) => void;
  setSubtaskStatus: (date: string, taskId: string, status: TaskStatus) => void;
  cycleSubtaskStatus: (date: string, taskId: string) => void;
  setHabitStatus: (date: string, habitId: string, status: TaskStatus) => void;
  cycleHabitStatus: (date: string, habitId: string) => void;
  updateDayLog: (date: string, updates: Partial<DayEntryLog>) => void;
  updateCalories: (date: string, calories: Partial<DayCalories>) => void;
  updateProgressions: (date: string, progressions: Partial<DayProgressions>) => void;
  updateDayWorks: (date: string, dayWorks: Partial<DayWorks>) => void;
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  updatePlanDay: (id: string, updates: Partial<PlanDay>) => void;
  addCustomTaskToDay: (dayId: string, task: Omit<CustomTask, 'id'>) => void;
  deleteCustomTaskFromDay: (dayId: string, taskId: string) => void;
  setReminderConfig: (config: Partial<ReminderConfig>) => void;
  replacePlanProgram: (newProgram: PlanProgram) => void;
  resetToDefaultPlan: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  exportCSV: () => string;
  playAudioChime: (type?: 'beep' | 'success' | 'interval') => void;
}

const STORAGE_KEY_PROGRAM = 'cyclesync_program_v1';
const STORAGE_KEY_HABITS = 'cyclesync_habits_v1';
const STORAGE_KEY_LOGS = 'cyclesync_logs_v1';
const STORAGE_KEY_REMINDER = 'cyclesync_reminder_v1';

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Next status in the 4-state cycle: pending -> completed (✓) -> failed (✗) -> postponed_cancelled (−) -> pending
export function getNextStatus(current: TaskStatus): TaskStatus {
  switch (current) {
    case 'pending':
      return 'completed';
    case 'completed':
      return 'failed';
    case 'failed':
      return 'postponed_cancelled';
    case 'postponed_cancelled':
      return 'pending';
    default:
      return 'completed';
  }
}

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayDate = getTodayString();
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  // Initialize Program
  const [program, setProgram] = useState<PlanProgram>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRAM);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PLAN_PROGRAM;
  });

  // Initialize Habits
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HABITS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_HABITS;
  });

  // Initialize Logs
  const [logs, setLogs] = useState<Record<string, DayEntryLog>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialLogs(7);
  });

  // Initialize Reminder Config
  const [reminderConfig, setReminderConfigState] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REMINDER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      enabled: true,
      time: '07:30',
      soundEnabled: true,
      customMessage: 'Time for your 9-Day cycle routine! Check today\'s target.',
    };
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROGRAM, JSON.stringify(program));
  }, [program]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REMINDER, JSON.stringify(reminderConfig));
  }, [reminderConfig]);

  // Audio synthesizer via Web Audio API
  const playAudioChime = (type: 'beep' | 'success' | 'interval' = 'beep') => {
    if (!reminderConfig.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'interval') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // AudioContext could be blocked by autoplay policies
    }
  };

  // Helper to ensure day log exists
  const ensureLog = (date: string): DayEntryLog => {
    if (logs[date]) return logs[date];

    // Compute cycle day based on date difference from start or relative index
    const sortedDates = Object.keys(logs).sort();
    let cycleDayNumber = 1;
    let loopNumber = 1;

    if (sortedDates.length > 0) {
      const earliest = new Date(sortedDates[0]);
      const target = new Date(date);
      const diffDays = Math.round((target.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));
      const cycleLen = program.cycleLength || 9;
      const totalOffset = diffDays >= 0 ? diffDays : (diffDays % cycleLen + cycleLen);
      cycleDayNumber = (totalOffset % cycleLen) + 1;
      loopNumber = Math.max(1, Math.floor(totalOffset / cycleLen) + 1);
    }

    const defaultDay = program.days.find((d) => d.dayNumber === cycleDayNumber) || program.days[0];

    const newLog: DayEntryLog = {
      id: `log-${date}`,
      date,
      cycleDayNumber,
      loopNumber,
      status: 'pending',
      tasksStatus: {},
      habitsStatus: {},
      calories: {
        consumed: 2500,
        burned: defaultDay ? defaultDay.estimatedBurn : 500,
        targetCalories: 2500,
        proteinGrams: 140,
        carbsGrams: 260,
        fatGrams: 65,
      },
      progressions: {
        bodyWeightKg: 74,
        strengthExercises: [],
      },
      dayWorks: {
        warmupCompleted: false,
        breathingCheck: false,
        workoutNotes: '',
        feeling: 'good',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newLog;
  };

  const updateDayLog = (date: string, updates: Partial<DayEntryLog>) => {
    const current = ensureLog(date);
    const updated: DayEntryLog = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setLogs((prev) => ({ ...prev, [date]: updated }));
  };

  const setDayStatus = (date: string, status: TaskStatus) => {
    updateDayLog(date, { status });
    if (status === 'completed') {
      playAudioChime('success');
    }
  };

  const cycleDayStatus = (date: string) => {
    const current = ensureLog(date);
    const next = getNextStatus(current.status);
    setDayStatus(date, next);
  };

  const setSubtaskStatus = (date: string, taskId: string, status: TaskStatus) => {
    const current = ensureLog(date);
    const newTasks = { ...current.tasksStatus, [taskId]: status };
    updateDayLog(date, { tasksStatus: newTasks });
    if (status === 'completed') playAudioChime('beep');
  };

  const cycleSubtaskStatus = (date: string, taskId: string) => {
    const current = ensureLog(date);
    const currentStatus = current.tasksStatus[taskId] || 'pending';
    const next = getNextStatus(currentStatus);
    setSubtaskStatus(date, taskId, next);
  };

  const setHabitStatus = (date: string, habitId: string, status: TaskStatus) => {
    const current = ensureLog(date);
    const newHabits = { ...current.habitsStatus, [habitId]: status };
    updateDayLog(date, { habitsStatus: newHabits });
    if (status === 'completed') playAudioChime('beep');
  };

  const cycleHabitStatus = (date: string, habitId: string) => {
    const current = ensureLog(date);
    const currentStatus = current.habitsStatus[habitId] || 'pending';
    const next = getNextStatus(currentStatus);
    setHabitStatus(date, habitId, next);
  };

  const updateCalories = (date: string, calories: Partial<DayCalories>) => {
    const current = ensureLog(date);
    updateDayLog(date, {
      calories: {
        ...current.calories,
        ...calories,
      },
    });
  };

  const updateProgressions = (date: string, progressions: Partial<DayProgressions>) => {
    const current = ensureLog(date);
    updateDayLog(date, {
      progressions: {
        ...current.progressions,
        ...progressions,
      },
    });
  };

  const updateDayWorks = (date: string, dayWorks: Partial<DayWorks>) => {
    const current = ensureLog(date);
    updateDayLog(date, {
      dayWorks: {
        ...current.dayWorks,
        ...dayWorks,
      },
    });
  };

  const addHabit = (habitData: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const updatePlanDay = (id: string, updates: Partial<PlanDay>) => {
    setProgram((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  };

  const addCustomTaskToDay = (dayId: string, task: Omit<CustomTask, 'id'>) => {
    const newTask: CustomTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setProgram((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId ? { ...d, customTasks: [...d.customTasks, newTask] } : d
      ),
    }));
  };

  const deleteCustomTaskFromDay = (dayId: string, taskId: string) => {
    setProgram((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId
          ? { ...d, customTasks: d.customTasks.filter((t) => t.id !== taskId) }
          : d
      ),
    }));
  };

  const setReminderConfig = (config: Partial<ReminderConfig>) => {
    setReminderConfigState((prev) => ({ ...prev, ...config }));
  };

  const replacePlanProgram = (newProgram: PlanProgram) => {
    setProgram(newProgram);
  };

  const resetToDefaultPlan = () => {
    setProgram(DEFAULT_PLAN_PROGRAM);
    setHabits(DEFAULT_HABITS);
    setLogs(generateInitialLogs(7));
  };

  const exportDataJSON = (): string => {
    const backup = {
      program,
      habits,
      logs,
      reminderConfig,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.program && Array.isArray(data.program.days)) {
        setProgram(data.program);
      }
      if (Array.isArray(data.habits)) {
        setHabits(data.habits);
      }
      if (data.logs && typeof data.logs === 'object') {
        setLogs(data.logs);
      }
      if (data.reminderConfig) {
        setReminderConfigState(data.reminderConfig);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const exportCSV = (): string => {
    const headers = [
      'Date',
      'Cycle Day',
      'Loop #',
      'Day Title',
      'Overall Status',
      'Calories Burned',
      'Calories Consumed',
      'Net Calories',
      'Running Distance (km)',
      'Running Duration (min)',
      'Running Speed (km/h)',
      'Body Weight (kg)',
      'RPE (1-10)',
      'Workout Notes',
    ];

    const sortedDates = Object.keys(logs).sort();
    const rows = sortedDates.map((date) => {
      const log = logs[date];
      const planDay = program.days.find((d) => d.dayNumber === log.cycleDayNumber);
      const title = planDay ? planDay.title : `Day ${log.cycleDayNumber}`;
      const netCal = (log.calories.consumed || 0) - (log.calories.burned || 0);

      return [
        date,
        log.cycleDayNumber,
        log.loopNumber,
        `"${title.replace(/"/g, '""')}"`,
        log.status,
        log.calories.burned || 0,
        log.calories.consumed || 0,
        netCal,
        log.progressions.runningDistanceKm ?? '',
        log.progressions.runningDurationMin ?? '',
        log.progressions.runningSpeedKmh ?? '',
        log.progressions.bodyWeightKg ?? '',
        log.progressions.rpeScore ?? '',
        `"${(log.dayWorks.workoutNotes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  // Derive active day and loop for selectedDate
  const currentLog = ensureLog(selectedDate);
  const currentCycleDayNumber = currentLog.cycleDayNumber;
  const currentLoop = currentLog.loopNumber;

  return (
    <TrackerContext.Provider
      value={{
        program,
        habits,
        logs,
        selectedDate,
        todayDate,
        currentLoop,
        currentCycleDayNumber,
        reminderConfig,
        setSelectedDate,
        setDayStatus,
        cycleDayStatus,
        setSubtaskStatus,
        cycleSubtaskStatus,
        setHabitStatus,
        cycleHabitStatus,
        updateDayLog,
        updateCalories,
        updateProgressions,
        updateDayWorks,
        addHabit,
        updateHabit,
        deleteHabit,
        updatePlanDay,
        addCustomTaskToDay,
        deleteCustomTaskFromDay,
        setReminderConfig,
        replacePlanProgram,
        resetToDefaultPlan,
        exportDataJSON,
        importDataJSON,
        exportCSV,
        playAudioChime,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
}
