'use client';

import { Pause, Play } from 'lucide-react';

interface TimerProps {
  display: string;
  isRunning: boolean;
  secondsLeft: number;
  totalSeconds: number;
  onPause: () => void;
  onResume: () => void;
}

export default function Timer({ display, isRunning, secondsLeft, totalSeconds, onPause, onResume }: TimerProps) {
  const pct = (secondsLeft / totalSeconds) * 100;
  const isWarning = secondsLeft <= 300;
  const isDanger = secondsLeft <= 60;

  const colorClass = isDanger
    ? 'text-white'
    : isWarning
    ? 'text-zinc-300'
    : 'text-zinc-400';

  return (
    <div className="flex items-center gap-4">
      <div className={`text-3xl font-bold font-mono tabular-nums ${colorClass}`}>
        {display}
      </div>
      <button
        onClick={isRunning ? onPause : onResume}
        className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center transition-colors duration-150 cursor-pointer"
        aria-label={isRunning ? '일시정지' : '재개'}
      >
        {isRunning
          ? <Pause className="w-3.5 h-3.5 text-zinc-300" />
          : <Play className="w-3.5 h-3.5 text-zinc-300" />
        }
      </button>
      <div className="flex-1 h-1.5 bg-zinc-800 overflow-hidden min-w-24">
        <div
          className="h-full bg-white transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
