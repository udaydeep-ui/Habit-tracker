import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, Timer } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

interface IntervalTimerProps {
  dayNumber: number;
  loopNumber: number;
  onFinish?: () => void;
}

export const IntervalTimer: React.FC<IntervalTimerProps> = ({
  dayNumber,
  loopNumber,
  onFinish,
}) => {
  const { playAudioChime } = useTracker();

  // Determine preset intervals based on the current day
  const getPreset = () => {
    if (dayNumber === 1) {
      return {
        name: '3m Run / 1m Walk × 5',
        workSec: 180,
        restSec: 60,
        totalSets: 5,
      };
    }
    if (dayNumber === 4) {
      // Add 1 burst every loop: Loop 1 = 5, Loop 2 = 6, etc.
      const bursts = 5 + (loopNumber - 1);
      return {
        name: `Fast Bursts (40s fast / 120s walk) × ${bursts}`,
        workSec: 40,
        restSec: 120,
        totalSets: bursts,
      };
    }
    if (dayNumber === 5) {
      return {
        name: '2m Run / 1m Walk × 6 + 4 Strides',
        workSec: 120,
        restSec: 60,
        totalSets: 6,
      };
    }
    if (dayNumber === 6) {
      // Loop 1 = 20m, add 5m every loop up to 60m
      const runningMin = Math.min(60, 20 + (loopNumber - 1) * 5);
      return {
        name: `Steady Run (${runningMin} min @ max 7 km/h)`,
        workSec: runningMin * 60,
        restSec: 0,
        totalSets: 1,
      };
    }
    if (dayNumber === 9) {
      return {
        name: 'Long Run-Walk (32 min continuous)',
        workSec: 180,
        restSec: 60,
        totalSets: 8,
      };
    }
    // Default rest/warmup timer
    return {
      name: 'Standard Rest / Set Timer (90s)',
      workSec: 90,
      restSec: 30,
      totalSets: 3,
    };
  };

  const preset = getPreset();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'work' | 'rest'>('work');
  const [currentSet, setCurrentSet] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState(preset.workSec);
  const [soundOn, setSoundOn] = useState(true);

  const prevSecondsRef = useRef(secondsRemaining);

  // Reset when dayNumber or loop changes
  useEffect(() => {
    setIsActive(false);
    setPhase('work');
    setCurrentSet(1);
    setSecondsRemaining(preset.workSec);
  }, [dayNumber, loopNumber]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      // Handle phase switch
      if (soundOn) playAudioChime('interval');

      if (phase === 'work') {
        if (preset.restSec > 0) {
          setPhase('rest');
          setSecondsRemaining(preset.restSec);
        } else {
          // No rest phase (e.g. continuous run)
          if (currentSet < preset.totalSets) {
            setCurrentSet((s) => s + 1);
            setSecondsRemaining(preset.workSec);
          } else {
            setIsActive(false);
            if (soundOn) playAudioChime('success');
            if (onFinish) onFinish();
          }
        }
      } else {
        // Rest completed -> go to next set
        if (currentSet < preset.totalSets) {
          setCurrentSet((s) => s + 1);
          setPhase('work');
          setSecondsRemaining(preset.workSec);
        } else {
          setIsActive(false);
          if (soundOn) playAudioChime('success');
          if (onFinish) onFinish();
        }
      }
    }

    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, phase, currentSet, preset, soundOn]);

  // Audio countdown beeps for last 3 seconds
  useEffect(() => {
    if (isActive && secondsRemaining <= 3 && secondsRemaining > 0 && prevSecondsRef.current !== secondsRemaining) {
      if (soundOn) playAudioChime('beep');
    }
    prevSecondsRef.current = secondsRemaining;
  }, [secondsRemaining, isActive, soundOn]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setPhase('work');
    setCurrentSet(1);
    setSecondsRemaining(preset.workSec);
  };

  const skipPhase = () => {
    setSecondsRemaining(0);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentTotal = phase === 'work' ? preset.workSec : preset.restSec;
  const progressPercent = currentTotal > 0 ? ((currentTotal - secondsRemaining) / currentTotal) * 100 : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Timer size={18} />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Run/Walk Interval Timer
            </span>
            <div className="text-sm font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
              {preset.name}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSoundOn(!soundOn)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={soundOn ? 'Sound On' : 'Muted'}
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Timer Display Card */}
      <div
        className={`relative overflow-hidden rounded-xl border p-4 text-center transition-all ${
          phase === 'work'
            ? 'bg-gradient-to-b from-emerald-950/40 to-slate-950 border-emerald-500/40'
            : 'bg-gradient-to-b from-cyan-950/40 to-slate-950 border-cyan-500/40'
        }`}
      >
        {/* Progress bar line */}
        <div
          className={`absolute top-0 left-0 h-1 transition-all duration-300 ${
            phase === 'work' ? 'bg-emerald-500' : 'bg-cyan-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        />

        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          <span
            className={`px-2 py-0.5 rounded-md ${
              phase === 'work'
                ? 'bg-emerald-500/20 text-emerald-400 font-black'
                : 'bg-cyan-500/20 text-cyan-300 font-black'
            }`}
          >
            {phase === 'work' ? '🏃 RUN / WORK INTERVAL' : '🚶 WALK / RECOVERY'}
          </span>
          <span>
            Set {currentSet} of {preset.totalSets}
          </span>
        </div>

        <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-slate-100 my-2">
          {formatTime(secondsRemaining)}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            type="button"
            onClick={resetTimer}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            title="Reset timer"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {isActive ? (
              <>
                <Pause size={18} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>Start Interval</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={skipPhase}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            title="Skip to next phase"
          >
            <FastForward size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
