'use client';

import { useEffect, useState } from 'react';

interface JumpScreenProps {
  destination: string;
}

export function JumpScreen({ destination }: JumpScreenProps) {
  const [stars, setStars] = useState<Array<{ x: number; y: number; speed: number }>>([]);

  // Generate stars on mount
  useEffect(() => {
    const newStars = Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.5 + Math.random() * 2,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Streaking stars animation */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.speed * 2}px`,
              height: '2px',
              boxShadow: '0 0 4px #fff',
              animation: `streak 0.5s linear infinite`,
              animationDelay: `${i * 0.01}s`,
            }}
          />
        ))}
      </div>

      {/* Jump text */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">
          JUMPING
        </h1>
        <p className="text-xl text-cyan-400">
          Destination: {destination}
        </p>
        <div className="mt-6 flex justify-center gap-1">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Add keyframe animation via style tag */}
      <style jsx>{`
        @keyframes streak {
          0% {
            transform: translateX(0) scaleX(1);
            opacity: 1;
          }
          100% {
            transform: translateX(50px) scaleX(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
