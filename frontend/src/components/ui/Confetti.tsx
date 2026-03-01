'use client';

import React, { useEffect, useState } from 'react';

interface Confetti {
  id: string;
  left: number;
  top: number;
  delay: number;
  color: string;
  size: number;
}

/**
 * Confetti Animation Component
 *
 * Displays celebratory confetti that falls across the screen
 * when an operation completes successfully.
 */
export const Confetti: React.FC<{ duration?: number }> = ({ duration = 3000 }) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    // Generate random confetti pieces
    const pieces: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: `confetti-${i}`,
      left: Math.random() * 100,
      top: -10,
      delay: Math.random() * 0.5,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][
        Math.floor(Math.random() * 6)
      ],
      size: Math.random() * 8 + 4,
    }));

    setConfetti(pieces);

    // Remove confetti after duration
    const timer = setTimeout(() => {
      setConfetti([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <>
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes sway {
          0%, 100% {
            transform: translateX(0) translateY(var(--fall-distance));
          }
          50% {
            transform: translateX(30px) translateY(var(--fall-distance));
          }
        }

        .confetti-piece {
          position: fixed;
          top: -10px;
          border-radius: 2px;
          z-index: 9999;
          animation: fall 3s linear forwards, sway 2s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 0.6}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            ['--fall-distance' as string]: `${100 + Math.random() * 20}vh`,
          }}
        />
      ))}
    </>
  );
};

export default Confetti;