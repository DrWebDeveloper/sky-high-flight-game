
import React, { useEffect, useState, useRef } from 'react';
import { PlaneTakeoff } from 'lucide-react';

interface GameCanvasProps {
  isGameActive: boolean;
  multiplier: number;
  onGameEnd: () => void;
  crashPoint: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  isGameActive, 
  multiplier, 
  onGameEnd,
  crashPoint
}) => {
  const [planePosition, setPlanePosition] = useState({ x: 5, y: 90 });
  const [crashed, setCrashed] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Calculate plane position based on multiplier
  useEffect(() => {
    if (!isGameActive) {
      return;
    }

    if (multiplier >= crashPoint) {
      setCrashed(true);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      onGameEnd();
      return;
    }

    // Update plane position based on multiplier
    const updatePosition = () => {
      const newX = 5 + (multiplier - 1) * 5; // Move right as multiplier increases
      const newY = 90 - (multiplier - 1) * 8; // Move up as multiplier increases
      setPlanePosition({ x: Math.min(newX, 90), y: Math.max(newY, 5) });
      
      animationRef.current = requestAnimationFrame(updatePosition);
    };

    animationRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isGameActive, multiplier, crashPoint, onGameEnd]);

  // Reset plane position when game restarts
  useEffect(() => {
    if (!isGameActive) {
      setCrashed(false);
      setPlanePosition({ x: 5, y: 90 });
    }
  }, [isGameActive]);

  return (
    <div 
      ref={canvasRef}
      className="w-full h-80 md:h-96 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden glass-panel"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full border-b border-dashed border-white/30"></div>
        <div className="w-full h-1/4 border-b border-dashed border-white/30"></div>
        <div className="w-full h-1/2 border-b border-dashed border-white/30"></div>
        <div className="w-full h-3/4 border-b border-dashed border-white/30"></div>
        
        <div className="h-full w-1/4 border-r border-dashed border-white/30 absolute top-0"></div>
        <div className="h-full w-1/2 border-r border-dashed border-white/30 absolute top-0"></div>
        <div className="h-full w-3/4 border-r border-dashed border-white/30 absolute top-0"></div>
      </div>
      
      {isGameActive && !crashed && (
        <div className="plane-trail" style={{ 
          clipPath: `polygon(0 100%, ${planePosition.x}% ${planePosition.y}%, 100% 100%)` 
        }}></div>
      )}
      
      <div 
        className={`absolute transition-all duration-150 ${crashed ? 'animate-crash text-game-danger' : 'text-game-primary'}`}
        style={{ 
          left: `${planePosition.x}%`, 
          top: `${planePosition.y}%`, 
          transform: crashed ? 'rotate(90deg)' : 'rotate(45deg)'
        }}
      >
        <PlaneTakeoff size={32} className="drop-shadow-lg" />
      </div>
      
      {!isGameActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-2xl font-bold text-white/70">PREPARING NEXT FLIGHT</p>
        </div>
      )}
      
      <div className="absolute bottom-4 left-0 right-0 text-center">
        {isGameActive && (
          <p className="multiplier-text text-5xl md:text-7xl font-bold animate-number-increase">
            {multiplier.toFixed(2)}x
          </p>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
