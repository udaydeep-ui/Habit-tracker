import { PlanProgram, Habit, DayEntryLog } from '../types';

export const DEFAULT_PLAN_PROGRAM: PlanProgram = {
  name: '9-DAY RUNNING + GYM PLAN',
  subtitle: 'Synced to your gym cycle. Repeat every 9 days.',
  cycleLength: 9,
  days: [
    {
      id: 'day-1',
      dayNumber: 1,
      title: 'Chest + back',
      type: 'easy',
      runningInstructions: 'Run-walk: 3 min run / 1 min walk × 5. Run before lifting.',
      gymFocus: 'Chest + back hypertrophy / compound lifts',
      hasWarmup: true,
      progressionRule: 'Maintain easy conversational pace on runs; record bench & row weights.',
      estimatedBurn: 520,
      targetDurationMin: 70,
      reminderTime: '07:00',
      customTasks: [
        { id: 'd1-t1', title: '5 min brisk walk warm-up', category: 'recovery' },
        { id: 'd1-t2', title: 'Run-walk: 3 min run / 1 min walk × 5 sets', category: 'cardio' },
        { id: 'd1-t3', title: 'Bench press & barbell rows', category: 'workout' },
        { id: 'd1-t4', title: 'Incline dumbbell press & lat pulldowns', category: 'workout' },
      ],
    },
    {
      id: 'day-2',
      dayNumber: 2,
      title: 'Legs',
      type: 'rest',
      runningInstructions: 'No running. The gym session is the workout.',
      gymFocus: 'Quads, hamstrings & calves (heavy session)',
      hasWarmup: false,
      progressionRule: 'Zero running allows maximum leg energy and heavy mechanical tension.',
      estimatedBurn: 480,
      targetDurationMin: 60,
      reminderTime: '08:00',
      customTasks: [
        { id: 'd2-t1', title: 'Dynamic leg swings & bodyweight squats', category: 'recovery' },
        { id: 'd2-t2', title: 'Barbell back squats or leg press', category: 'workout' },
        { id: 'd2-t3', title: 'Romanian deadlifts & walking lunges', category: 'workout' },
        { id: 'd2-t4', title: 'Calf raises & hamstring curls', category: 'workout' },
      ],
    },
    {
      id: 'day-3',
      dayNumber: 3,
      title: 'Arms + shoulders',
      type: 'rest',
      runningInstructions: 'Rest from running. Let your legs recover.',
      gymFocus: 'Biceps, triceps, side & rear delts',
      hasWarmup: false,
      progressionRule: 'Allow lower body connective tissue full 48h rest before Day 4 bursts.',
      estimatedBurn: 420,
      targetDurationMin: 55,
      reminderTime: '07:30',
      customTasks: [
        { id: 'd3-t1', title: 'Overhead shoulder press', category: 'workout' },
        { id: 'd3-t2', title: 'Lateral raises & face pulls', category: 'workout' },
        { id: 'd3-t3', title: 'Barbell curls & tricep skullcrushers', category: 'workout' },
        { id: 'd3-t4', title: 'Hammer curls & rope pushdowns', category: 'workout' },
      ],
    },
    {
      id: 'day-4',
      dayNumber: 4,
      title: 'Abs + stretch',
      type: 'hard',
      runningInstructions: '5 fast bursts of 30–45 sec, 2 min walk between each. Add 1 burst every loop.',
      gymFocus: 'Core strength, deep hip flexor & lower back mobility',
      hasWarmup: true,
      progressionRule: 'Loop progression: Start at 5 bursts. Loop 2: 6 bursts. Loop 3: 7 bursts.',
      estimatedBurn: 460,
      targetDurationMin: 50,
      reminderTime: '07:00',
      customTasks: [
        { id: 'd4-t1', title: 'Warm-up: 5 min brisk walk + high knees & ankle skips', category: 'recovery' },
        { id: 'd4-t2', title: 'Fast running bursts: 30-45s fast / 2 min walk', category: 'cardio' },
        { id: 'd4-t3', title: 'Hanging leg raises & cable woodchoppers', category: 'workout' },
        { id: 'd4-t4', title: 'Plank rotations & deep hip stretch', category: 'recovery' },
      ],
    },
    {
      id: 'day-5',
      dayNumber: 5,
      title: 'Chest + shoulders',
      type: 'easy',
      runningInstructions: 'Run-walk: 2 min run / 1 min walk × 6, then 4 strides. Run before lifting.',
      gymFocus: 'Upper chest & anterior / lateral deltoids',
      hasWarmup: true,
      progressionRule: '4 strides: 15 sec relaxed fast, walk back between strides × 4.',
      estimatedBurn: 540,
      targetDurationMin: 70,
      reminderTime: '07:00',
      customTasks: [
        { id: 'd5-t1', title: '5 min walk + Warm-up drills', category: 'recovery' },
        { id: 'd5-t2', title: 'Run-walk: 2 min run / 1 min walk × 6', category: 'cardio' },
        { id: 'd5-t3', title: '4 Strides: 15s relaxed fast, walk back × 4', category: 'cardio' },
        { id: 'd5-t4', title: 'Dumbbell incline press & Arnold press', category: 'workout' },
      ],
    },
    {
      id: 'day-6',
      dayNumber: 6,
      title: 'Back',
      type: 'long_run',
      runningInstructions: 'Steady run, no faster than 7 km/h. Start at 20 min of running, add 5 min every loop up to 60. Only running time counts. Run before lifting.',
      gymFocus: 'Lats, rhomboids, upper traps & grip strength',
      hasWarmup: true,
      progressionRule: 'Loop progression: Loop 1 = 20 min. Loop 2 = 25 min. Loop 3 = 30 min (cap at 60 min). Strictly cap speed at 7 km/h!',
      estimatedBurn: 620,
      targetDurationMin: 80,
      reminderTime: '06:30',
      customTasks: [
        { id: 'd6-t1', title: '5 min brisk walk + drills (2 × 20m high knees, butt kicks)', category: 'recovery' },
        { id: 'd6-t2', title: 'Steady run @ max 7 km/h (Target for current loop)', category: 'cardio' },
        { id: 'd6-t3', title: 'Deadlifts or rack pulls', category: 'workout' },
        { id: 'd6-t4', title: 'Seated cable rows & wide grip pulldowns', category: 'workout' },
      ],
    },
    {
      id: 'day-7',
      dayNumber: 7,
      title: 'Legs + abs',
      type: 'rest',
      runningInstructions: 'No running.',
      gymFocus: 'Leg hypertrophy & rectus abdominis',
      hasWarmup: false,
      progressionRule: 'Zero running allows maximum squat output following Day 6 steady endurance.',
      estimatedBurn: 470,
      targetDurationMin: 60,
      reminderTime: '08:00',
      customTasks: [
        { id: 'd7-t1', title: 'Front squats / Hack squats', category: 'workout' },
        { id: 'd7-t2', title: 'Bulgarian split squats', category: 'workout' },
        { id: 'd7-t3', title: 'Lying leg curls & calf press', category: 'workout' },
        { id: 'd7-t4', title: 'Ab wheel rollouts & decline crunches', category: 'workout' },
      ],
    },
    {
      id: 'day-8',
      dayNumber: 8,
      title: 'Arms',
      type: 'rest',
      runningInstructions: 'Rest from running.',
      gymFocus: 'Biceps, triceps & forearms isolation',
      hasWarmup: false,
      progressionRule: 'Keep legs elevated and well-hydrated to prepare for Day 9 long run-walk test.',
      estimatedBurn: 390,
      targetDurationMin: 50,
      reminderTime: '07:30',
      customTasks: [
        { id: 'd8-t1', title: 'Close-grip bench press', category: 'workout' },
        { id: 'd8-t2', title: 'EZ bar preacher curls', category: 'workout' },
        { id: 'd8-t3', title: 'Dips / Cable overhead extensions', category: 'workout' },
        { id: 'd8-t4', title: 'Incline dumbbell curls & wrist curls', category: 'workout' },
      ],
    },
    {
      id: 'day-9',
      dayNumber: 9,
      title: 'Stretch + cooldown',
      type: 'hard',
      runningInstructions: 'Long run-walk, 30–35 min. Walk instead of stopping when breathless, restart running at 7 km/h.',
      gymFocus: 'Full body restorative mobility, foam rolling & cooldown',
      hasWarmup: false,
      progressionRule: 'Active recovery principle: never stop completely when breathless; walk smoothly, then resume 7 km/h.',
      estimatedBurn: 450,
      targetDurationMin: 55,
      reminderTime: '07:00',
      customTasks: [
        { id: 'd9-t1', title: 'Long run-walk (30-35 min total duration)', category: 'cardio' },
        { id: 'd9-t2', title: 'Walk when breathless; resume running at 7 km/h', category: 'cardio' },
        { id: 'd9-t3', title: '15 min lower body foam rolling (quads, IT band, calves)', category: 'recovery' },
        { id: 'd9-t4', title: 'Hamstring & hip flexor static stretches (hold 45s each)', category: 'recovery' },
      ],
    },
  ],
  rules: {
    warmupDrills: [
      'Start with a 5 min brisk walk.',
      'High-knee march, butt kicks, quick ankle skips: 2 × 20 m each.',
      'Strides (Day 5): 15 sec relaxed fast, walk back, × 4.',
    ],
    breathingRules: [
      'Belly breaths: stomach pushes out as you breathe in.',
      'Rhythm: in for 3 steps, out for 2.',
      'Easy days should feel chatty. Start slower for the first 2 min.',
    ],
    rules: [
      'Run before lifting on chest and back days.',
      'Missed a day? Shift gym and running together to stay in sync.',
      'Day 6 is right before leg day: cap it at 7 km/h.',
    ],
    medicalAlerts: [
      'You get wheezing, chest tightness, or a cough after runs.',
      'You still hit the same breathing wall on fresh days after 3–4 weeks.',
    ],
  },
};

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Daily Hydration (3L Water)',
    frequency: 'daily',
    category: 'hydration',
    target: '3,000 ml',
    icon: '💧',
    reminderTime: '09:00',
  },
  {
    id: 'habit-2',
    title: 'Creatine Monohydrate (5g)',
    frequency: 'daily',
    category: 'supplements',
    target: '5 g',
    icon: '⚡',
    reminderTime: '08:30',
  },
  {
    id: 'habit-3',
    title: 'Belly Breathing Drill (In 3, Out 2)',
    frequency: 'workout_days',
    category: 'mobility',
    target: '5 mins',
    icon: '🫁',
    reminderTime: '06:45',
  },
  {
    id: 'habit-4',
    title: 'Protein Goal (140g+)',
    frequency: 'daily',
    category: 'nutrition',
    target: '140 g',
    icon: '🥩',
    reminderTime: '20:00',
  },
  {
    id: 'habit-5',
    title: 'Sleep 8 Hours',
    frequency: 'daily',
    category: 'sleep',
    target: '8.0 hrs',
    icon: '🌙',
    reminderTime: '22:30',
  },
  {
    id: 'habit-6',
    title: 'Foam Rolling & Mobility',
    frequency: 'daily',
    category: 'mobility',
    target: '10 mins',
    icon: '🧘',
    reminderTime: '21:00',
  },
];

// Helper to generate seed logs for past days up to today
export function generateInitialLogs(daysCount: number = 7): Record<string, DayEntryLog> {
  const logs: Record<string, DayEntryLog> = {};
  const today = new Date();

  // Create logs from 6 days ago to today
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Cycle day 1 to 9 based on index
    const cycleDay = (daysCount - 1 - i + 1) > 9 ? ((daysCount - 1 - i) % 9) + 1 : (daysCount - 1 - i + 1);
    const loop = Math.floor((daysCount - 1 - i) / 9) + 1;

    // Set statuses: realistic mix of completed tick, postponed minus, completed tick
    let status: DayEntryLog['status'] = 'completed';
    if (i === 4) status = 'postponed_cancelled'; // 4 days ago postponed
    if (i === 2) status = 'completed';
    if (i === 0) status = 'pending'; // Today is fresh

    const caloriesBurned = [520, 480, 420, 460, 540, 610, 470][(daysCount - 1 - i) % 7] || 500;
    const caloriesConsumed = [2450, 2600, 2380, 2520, 2700, 2850, 2400][(daysCount - 1 - i) % 7] || 2500;

    logs[dateStr] = {
      id: `log-${dateStr}`,
      date: dateStr,
      cycleDayNumber: cycleDay,
      loopNumber: loop,
      status: status,
      tasksStatus: {
        'd1-t1': 'completed',
        'd1-t2': status === 'postponed_cancelled' ? 'postponed_cancelled' : 'completed',
        'd1-t3': status === 'postponed_cancelled' ? 'failed' : 'completed',
        'd1-t4': 'completed',
      },
      habitsStatus: {
        'habit-1': 'completed',
        'habit-2': 'completed',
        'habit-3': status === 'completed' ? 'completed' : 'postponed_cancelled',
        'habit-4': 'completed',
        'habit-5': i % 2 === 0 ? 'completed' : 'failed',
        'habit-6': 'completed',
      },
      calories: {
        consumed: caloriesConsumed,
        burned: caloriesBurned,
        targetCalories: 2500,
        proteinGrams: 145,
        carbsGrams: 280,
        fatGrams: 65,
      },
      progressions: {
        bodyWeightKg: 74.2 - (daysCount - 1 - i) * 0.1,
        runningDistanceKm: cycleDay === 6 ? 3.5 : cycleDay === 1 || cycleDay === 5 ? 2.8 : undefined,
        runningDurationMin: cycleDay === 6 ? 25 : cycleDay === 1 || cycleDay === 5 ? 20 : undefined,
        runningSpeedKmh: cycleDay === 6 ? 6.8 : 7.2,
        intervalsCompleted: cycleDay === 4 ? 5 : cycleDay === 1 ? 5 : undefined,
        rpeScore: 7,
        strengthExercises: [
          {
            id: 'ex-1',
            name: cycleDay === 1 ? 'Bench Press' : cycleDay === 2 ? 'Barbell Squat' : 'Overhead Press',
            sets: [
              { weightKg: 80, reps: 8, rpe: 7 },
              { weightKg: 85, reps: 6, rpe: 8 },
              { weightKg: 85, reps: 6, rpe: 9 },
            ],
            notes: 'Felt strong, clean lockout',
            isPR: i === 3,
          },
        ],
      },
      dayWorks: {
        warmupCompleted: true,
        breathingCheck: true,
        workoutNotes: `Completed cycle day ${cycleDay} session with good cadence and energy.`,
        feeling: 'good',
      },
      createdAt: new Date(d.setHours(8, 0, 0, 0)).toISOString(),
      updatedAt: new Date(d.setHours(20, 30, 0, 0)).toISOString(),
    };
  }

  return logs;
}
