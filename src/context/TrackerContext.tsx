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
  activeLoop: number;
  activeCycleDayNumber: number;
  currentLoop: number;
  currentCycleDayNumber: number;
  selectedDate: string;
  todayDate: string;
  reminderConfig: ReminderConfig;
  allLoops: number[];
  setActiveLoop: (loop: number) => void;
  setActiveCycleDay: (dayNum: number) => void;
  advanceToNextDay: () => void;
  goToPreviousDay: () => void;
  advanceToNextLoop: () => void;
  setSelectedDate: (date: string) => void;
  getActiveLog: () => DayEntryLog;
  getLog: (loop: number, dayNum: number) => DayEntryLog;
  setCycleDayStatus: (loop: number, dayNum: number, status: TaskStatus) => void;
  cycleActiveDayStatus: () => void;
  setCycleSubtaskStatus: (loop: number, dayNum: number, taskId: string, status: TaskStatus) => void;
  cycleCycleSubtaskStatus: (loop: number, dayNum: number, taskId: string) => void;
  setCycleHabitStatus: (loop: number, dayNum: number, habitId: string, status: TaskStatus) => void;
  cycleCycleHabitStatus: (loop: number, dayNum: number, habitId: string) => void;
  setHabitStatus: (dateOrKey: string, habitId: string, status: TaskStatus) => void;
  cycleHabitStatus: (dateOrKey: string, habitId: string) => void;
  setDayStatus: (dateOrKey: string, status: TaskStatus) => void;
  updateActiveLog: (updates: Partial<DayEntryLog>) => void;
  updateActiveCalories: (calories: Partial<DayCalories>) => void;
  updateActiveProgressions: (progressions: Partial<DayProgressions>) => void;
  updateActiveDayWorks: (dayWorks: Partial<DayWorks>) => void;
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

const STORAGE_KEY_PROGRAM = 'cyclesync_program_v2';
const STORAGE_KEY_HABITS = 'cyclesync_habits_v2';
const STORAGE_KEY_LOGS = 'cyclesync_logs_v2';
const STORAGE_KEY_REMINDER = 'cyclesync_reminder_v2';
const STORAGE_KEY_ACTIVE_LOOP = 'cyclesync_active_loop_v2';
const STORAGE_KEY_ACTIVE_DAY = 'cyclesync_active_day_v2';

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

export const getCycleKey = (loop: number, dayNum: number) => `L${loop}-D${dayNum}`;

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayDate = getTodayString();
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  // Active Loop & Active Cycle Day (1..9), decoupled from calendar dates
  const [activeLoop, setActiveLoopState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_LOOP);
      if (saved) return Math.max(1, parseInt(saved, 10));
    } catch (e) {
      console.error(e);
    }
    return 1;
  });

  const [activeCycleDayNumber, setActiveCycleDayState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_DAY);
      if (saved) return Math.max(1, Math.min(9, parseInt(saved, 10)));
    } catch (e) {
      console.error(e);
    }
    return 7; // Default to active session
  });

  // Program
  const [program, setProgram] = useState<PlanProgram>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRAM);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PLAN_PROGRAM;
  });

  // Habits
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HABITS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_HABITS;
  });

  // Logs keyed by L{loop}-D{day}
  const [logs, setLogs] = useState<Record<string, DayEntryLog>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialLogs();
  });

  // Reminder Config
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
      customMessage: 'Time for your 9-Day cycle routine! Check today\'s session target.',
    };
  });

  // Persist states
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_LOOP, String(activeLoop));
  }, [activeLoop]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_DAY, String(activeCycleDayNumber));
  }, [activeCycleDayNumber]);

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
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'interval') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
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

  // Helper to ensure a log entry exists for a specific loop and dayNum
  const getLog = (loop: number, dayNum: number): DayEntryLog => {
    const cycleKey = getCycleKey(loop, dayNum);
    if (logs[cycleKey]) return logs[cycleKey];

    // If not found, check if an entry exists by matching loopNumber & cycleDayNumber
    const existing = Object.values(logs).find(
      (l) => l.loopNumber === loop && l.cycleDayNumber === dayNum
    );
    if (existing) return existing;

    const defaultDay = program.days.find((d) => d.dayNumber === dayNum) || program.days[0];

    const newLog: DayEntryLog = {
      id: `log-l${loop}-d${dayNum}`,
      date: todayDate,
      cycleDayNumber: dayNum,
      loopNumber: loop,
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

  const getActiveLog = (): DayEntryLog => {
    return getLog(activeLoop, activeCycleDayNumber);
  };

  const updateLog = (loop: number, dayNum: number, updates: Partial<DayEntryLog>) => {
    const cycleKey = getCycleKey(loop, dayNum);
    const current = getLog(loop, dayNum);
    const updated: DayEntryLog = {
      ...current,
      ...updates,
      loopNumber: loop,
      cycleDayNumber: dayNum,
      updatedAt: new Date().toISOString(),
    };

    setLogs((prev) => {
      const next = { ...prev, [cycleKey]: updated };
      // Also map to date for calendar reflection if date is set
      if (updated.date) {
        next[updated.date] = updated;
      }
      return next;
    });
  };

  const updateActiveLog = (updates: Partial<DayEntryLog>) => {
    updateLog(activeLoop, activeCycleDayNumber, updates);
  };

  const setCycleDayStatus = (loop: number, dayNum: number, status: TaskStatus) => {
    updateLog(loop, dayNum, { status });
    if (status === 'completed') {
      playAudioChime('success');
    }
  };

  const cycleActiveDayStatus = () => {
    const current = getActiveLog();
    const next = getNextStatus(current.status);
    setCycleDayStatus(activeLoop, activeCycleDayNumber, next);
  };

  const setCycleSubtaskStatus = (loop: number, dayNum: number, taskId: string, status: TaskStatus) => {
    const current = getLog(loop, dayNum);
    const newTasks = { ...current.tasksStatus, [taskId]: status };
    updateLog(loop, dayNum, { tasksStatus: newTasks });
    if (status === 'completed') playAudioChime('beep');
  };

  const cycleCycleSubtaskStatus = (loop: number, dayNum: number, taskId: string) => {
    const current = getLog(loop, dayNum);
    const currentStatus = current.tasksStatus[taskId] || 'pending';
    const next = getNextStatus(currentStatus);
    setCycleSubtaskStatus(loop, dayNum, taskId, next);
  };

  const setCycleHabitStatus = (loop: number, dayNum: number, habitId: string, status: TaskStatus) => {
    const current = getLog(loop, dayNum);
    const newHabits = { ...current.habitsStatus, [habitId]: status };
    updateLog(loop, dayNum, { habitsStatus: newHabits });
    if (status === 'completed') playAudioChime('beep');
  };

  const cycleCycleHabitStatus = (loop: number, dayNum: number, habitId: string) => {
    const current = getLog(loop, dayNum);
    const currentStatus = current.habitsStatus[habitId] || 'pending';
    const next = getNextStatus(currentStatus);
    setCycleHabitStatus(loop, dayNum, habitId, next);
  };

  const setHabitStatus = (dateOrKey: string, habitId: string, status: TaskStatus) => {
    setLogs((prev) => {
      const current = prev[dateOrKey] || {
        id: `log-${dateOrKey}`,
        date: dateOrKey,
        cycleDayNumber: activeCycleDayNumber,
        loopNumber: activeLoop,
        status: 'pending',
        tasksStatus: {},
        habitsStatus: {},
        calories: { consumed: 2500, burned: 500 },
        progressions: { strengthExercises: [] },
        dayWorks: { warmupCompleted: false, breathingCheck: false, workoutNotes: '', feeling: 'good' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        [dateOrKey]: {
          ...current,
          habitsStatus: {
            ...current.habitsStatus,
            [habitId]: status,
          },
          updatedAt: new Date().toISOString(),
        },
      };
    });
    if (status === 'completed') playAudioChime('beep');
  };

  const cycleHabitStatus = (dateOrKey: string, habitId: string) => {
    const currentStatus = logs[dateOrKey]?.habitsStatus?.[habitId] || 'pending';
    const next = getNextStatus(currentStatus);
    setHabitStatus(dateOrKey, habitId, next);
  };

  const setDayStatus = (dateOrKey: string, status: TaskStatus) => {
    setCycleDayStatus(activeLoop, activeCycleDayNumber, status);
  };

  const updateActiveCalories = (calories: Partial<DayCalories>) => {
    const current = getActiveLog();
    updateActiveLog({
      calories: {
        ...current.calories,
        ...calories,
      },
    });
  };

  const updateActiveProgressions = (progressions: Partial<DayProgressions>) => {
    const current = getActiveLog();
    updateActiveLog({
      progressions: {
        ...current.progressions,
        ...progressions,
      },
    });
  };

  const updateActiveDayWorks = (dayWorks: Partial<DayWorks>) => {
    const current = getActiveLog();
    updateActiveLog({
      dayWorks: {
        ...current.dayWorks,
        ...dayWorks,
      },
    });
  };

  // Navigation between days in the 9-day cycle
  const setActiveCycleDay = (dayNum: number) => {
    const clamped = Math.max(1, Math.min(program.cycleLength || 9, dayNum));
    setActiveCycleDayState(clamped);
  };

  const advanceToNextDay = () => {
    const cycleLen = program.cycleLength || 9;
    if (activeCycleDayNumber < cycleLen) {
      setActiveCycleDayState((prev) => prev + 1);
    } else {
      // Completed day 9 -> advance loop and restart at day 1!
      advanceToNextLoop();
    }
  };

  const goToPreviousDay = () => {
    if (activeCycleDayNumber > 1) {
      setActiveCycleDayState((prev) => prev - 1);
    } else if (activeLoop > 1) {
      // Go to day 9 of previous loop
      setActiveLoopState((prev) => prev - 1);
      setActiveCycleDayState(program.cycleLength || 9);
    }
  };

  const advanceToNextLoop = () => {
    setActiveLoopState((prev) => prev + 1);
    setActiveCycleDayState(1);
    playAudioChime('success');
  };

  const setActiveLoop = (loop: number) => {
    setActiveLoopState(Math.max(1, loop));
  };

  // Derive all active loops list
  const existingLoops = Array.from(
    new Set(
      Object.values(logs)
        .map((l) => l.loopNumber || 1)
        .concat([activeLoop])
    )
  ).sort((a, b) => a - b);

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
    setLogs(generateInitialLogs());
    setActiveLoopState(1);
    setActiveCycleDayState(1);
  };

  const exportDataJSON = (): string => {
    const backup = {
      program,
      habits,
      logs,
      activeLoop,
      activeCycleDayNumber,
      reminderConfig,
      exportedAt: new Date().toISOString(),
      version: '2.0',
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
      if (data.activeLoop) {
        setActiveLoopState(data.activeLoop);
      }
      if (data.activeCycleDayNumber) {
        setActiveCycleDayState(data.activeCycleDayNumber);
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
      'Loop #',
      'Cycle Day #',
      'Session Date',
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

    // Filter unique cycle logs
    const seen = new Set<string>();
    const cycleLogs: DayEntryLog[] = [];

    Object.values(logs).forEach((log) => {
      const key = `${log.loopNumber}-${log.cycleDayNumber}`;
      if (!seen.has(key)) {
        seen.add(key);
        cycleLogs.push(log);
      }
    });

    cycleLogs.sort((a, b) => {
      if (a.loopNumber !== b.loopNumber) return a.loopNumber - b.loopNumber;
      return a.cycleDayNumber - b.cycleDayNumber;
    });

    const rows = cycleLogs.map((log) => {
      const planDay = program.days.find((d) => d.dayNumber === log.cycleDayNumber);
      const title = planDay ? planDay.title : `Day ${log.cycleDayNumber}`;
      const netCal = (log.calories?.consumed || 0) - (log.calories?.burned || 0);

      return [
        log.loopNumber,
        log.cycleDayNumber,
        log.date || '',
        `"${title.replace(/"/g, '""')}"`,
        log.status,
        log.calories?.burned || 0,
        log.calories?.consumed || 0,
        netCal,
        log.progressions?.runningDistanceKm ?? '',
        log.progressions?.runningDurationMin ?? '',
        log.progressions?.runningSpeedKmh ?? '',
        log.progressions?.bodyWeightKg ?? '',
        log.progressions?.rpeScore ?? '',
        `"${(log.dayWorks?.workoutNotes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <TrackerContext.Provider
      value={{
        program,
        habits,
        logs,
        activeLoop,
        activeCycleDayNumber,
        currentLoop: activeLoop,
        currentCycleDayNumber: activeCycleDayNumber,
        selectedDate,
        todayDate,
        reminderConfig,
        allLoops: existingLoops,
        setActiveLoop,
        setActiveCycleDay,
        advanceToNextDay,
        goToPreviousDay,
        advanceToNextLoop,
        setSelectedDate,
        getActiveLog,
        getLog,
        setCycleDayStatus,
        cycleActiveDayStatus,
        setCycleSubtaskStatus,
        cycleCycleSubtaskStatus,
        setCycleHabitStatus,
        cycleCycleHabitStatus,
        setHabitStatus,
        cycleHabitStatus,
        setDayStatus,
        updateActiveLog,
        updateActiveCalories,
        updateActiveProgressions,
        updateActiveDayWorks,
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
