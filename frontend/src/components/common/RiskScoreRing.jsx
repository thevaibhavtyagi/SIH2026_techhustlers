import { useEffect, useState, useRef } from 'react';

export default function RiskScoreRing({ score, size = 120, strokeWidth = 10, className = '' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = eased * score;
      setAnimatedScore(Math.round(start));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const getColor = (s) => {
    if (s >= 75) return '#ef4444';
    if (s >= 60) return '#f97316';
    if (s >= 40) return '#f59e0b';
    return '#22c55e';
  };

  const getLabel = (s) => {
    if (s >= 75) return 'CRITICAL';
    if (s >= 60) return 'HIGH';
    if (s >= 40) return 'MODERATE';
    return 'LOW';
  };

  const color = getColor(animatedScore);
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx={center} cy={center} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{animatedScore}</span>
        <span className="text-[9px] font-bold tracking-wider" style={{ color }}>{getLabel(score)}</span>
      </div>
    </div>
  );
}
