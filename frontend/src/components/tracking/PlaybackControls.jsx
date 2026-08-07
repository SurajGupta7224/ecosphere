import React, { memo } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';
import { formatTimeString } from '../../utils/geoUtils';

const PlaybackControls = ({
  points,
  playbackState,
  onStartPlayback,
  onPausePlayback,
  onResetPlayback,
  onIndexChange,
  onSpeedChange
}) => {
  if (!points || points.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-400 font-medium">
        No GPS points recorded for route playback yet.
      </div>
    );
  }

  const currentPoint = points[playbackState.currentIndex] || points[0];
  const progressPercent = Math.round(((playbackState.currentIndex + 1) / points.length) * 100);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          Route Playback
        </span>
        <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
          Point {playbackState.currentIndex + 1} / {points.length} ({formatTimeString(currentPoint?.timestamp)})
        </span>
      </div>

      {/* Progress Bar & Scrubber */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={points.length - 1}
          value={playbackState.currentIndex}
          onChange={(e) => onIndexChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
        />
        <span className="text-xs font-black text-slate-700 w-9 text-right">{progressPercent}%</span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
        <div className="flex items-center gap-2">
          {playbackState.isPlaying ? (
            <button
              onClick={onPausePlayback}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onStartPlayback}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play Trip</span>
            </button>
          )}

          <button
            onClick={onResetPlayback}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="Reset Playback"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
          <span className="text-slate-400 px-1">Speed:</span>
          {[1, 2, 4].map((speedVal) => (
            <button
              key={speedVal}
              onClick={() => onSpeedChange(speedVal)}
              className={`px-2 py-0.5 rounded ${
                playbackState.speed === speedVal
                  ? 'bg-sky-600 text-white font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {speedVal}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(PlaybackControls);
