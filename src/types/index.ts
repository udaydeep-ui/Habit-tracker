export type TaskStatus = 'completed' | 'failed' | 'postponed_cancelled' | 'pending';

export type DayType = 'easy' | 'hard' | 'rest' | 'long_run';

export interface CustomTask {
  id: string;
  title: string;
  category: 'workout' | 'cardio' | 'nutrition' | 'recovery' | 'custom';
  targetValue?: string;
  notes?: string;
}

export interface PlanDay {
  id: string;
  dayNumber: number;
  title: string;
  type: DayType;
  runningInstructions: string;
  gymFocus: string;
  hasWarmup: boolean;
  progressionRule?: string;
  estimatedBurn: number;
  targetDurationMin: number;
  reminderTime?: string;
  customTasks: CustomTask[];
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'workout_days' | 'rest_days';
  category: 'hydration' | 'supplements' | 'sleep' | 'nutrition' | 'mobility' | 'custom';
  target?: string;
  icon?: string;
  reminderTime?: string;
}

export interface StrengthSet {
  weightKg: number;
  reps: number;
  rpe?: number;
}

export interface StrengthExercise {
  id: string;
  name: string;
  sets: StrengthSet[];
  notes?: string;
  isPR?: boolean;
}

export interface DayCalories {
  consumed: number;
  burned: number;
  targetCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
}

export interface DayProgressions {
  bodyWeightKg?: number;
  runningDistanceKm?: number;
  runningDurationMin?: number;
  runningSpeedKmh?: number;
  intervalsCompleted?: number;
  rpeScore?: number; // 1-10
  strengthExercises: StrengthExercise[];
}

export interface DayWorks {
  warmupCompleted: boolean;
  breathingCheck: boolean;
  workoutNotes: string;
  feeling: 'energized' | 'good' | 'tired' | 'sore' | 'exhausted';
}

export interface DayEntryLog {
  id: string;
  date: string; // YYYY-MM-DD
  cycleDayNumber: number;
  loopNumber: number;
  status: TaskStatus; // overall day status
  tasksStatus: Record<string, TaskStatus>; // subtask id -> status
  habitsStatus: Record<string, TaskStatus>; // habit id -> status
  calories: DayCalories;
  progressions: DayProgressions;
  dayWorks: DayWorks;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderConfig {
  enabled: boolean;
  time: string; // e.g. "07:30"
  soundEnabled: boolean;
  customMessage: string;
}

export interface PlanRules {
  warmupDrills: string[];
  breathingRules: string[];
  rules: string[];
  medicalAlerts: string[];
}

export interface PlanProgram {
  name: string;
  subtitle: string;
  cycleLength: number;
  days: PlanDay[];
  rules: PlanRules;
}
