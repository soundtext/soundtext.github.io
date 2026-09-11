interface AudioVisualizerProps {
  isPlaying: boolean;
  isPaused: boolean;
}

export function AudioVisualizer({ isPlaying, isPaused }: AudioVisualizerProps) {
  const bars = [18, 36, 62, 44, 78, 52, 90, 68, 84, 48, 65, 30, 55, 75, 40, 25];

  return (
    <div
      id="audio-visualizer"
      aria-label="Audio playback visualizer"
      className="flex items-center gap-1 h-8 px-3 py-1 rounded-xs bg-neutral-100 border border-neutral-200"
    >
      {bars.map((height, idx) => {
        const isActive = isPlaying && !isPaused;
        return (
          <span
            key={idx}
            className={`w-1 rounded-full transition-all duration-300 ${
              isActive ? 'bg-neutral-800' : 'bg-neutral-300'
            }`}
            style={{
              height: isActive ? `${height}%` : '20%',
              animation: isActive ? `wavePulse 1.2s ease-in-out infinite alternate` : 'none',
              animationDelay: `${(idx % 6) * 0.15}s`,
            }}
          />
        );
      })}
    </div>
  );
}
