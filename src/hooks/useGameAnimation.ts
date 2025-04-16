
import { useRef, useCallback } from 'react';
import { GAME_CANVAS } from '@/constants/gameConstants';

interface GameAnimationProps {
  isGameActive: boolean;
  multiplier: number;
  crashPoint: number;
}

interface PlanePosition {
  x: number;
  y: number;
  angle: number;
}

export const useGameAnimation = ({ isGameActive, multiplier, crashPoint }: GameAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);
  const currentPlanePos = useRef<PlanePosition>({ x: 50, y: 400, angle: 0 });
  const pathPointsRef = useRef<{ x: number; y: number }[]>([{ x: 50, y: 400 }]);
  const verticalOffsetRef = useRef(0);
  const flyAwayStartTime = useRef<number | null>(null);
  const startAnimationTime = useRef<number | null>(null);
  
  // Add references for background planes
  const backgroundPlanesRef = useRef<PlanePosition[]>([]);
  
  // Initialize background planes
  const initBackgroundPlanes = useCallback(() => {
    const { DEFAULT_WIDTH, DEFAULT_HEIGHT } = GAME_CANVAS;
    
    // Create random background planes
    backgroundPlanesRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * DEFAULT_WIDTH,
      y: Math.random() * DEFAULT_HEIGHT,
      angle: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Add new method to calculate predicted trajectory points
  const calculateTrajectoryPoints = useCallback((currentMultiplier: number) => {
    if (!isGameActive || currentMultiplier < 1) return [];
    
    const { DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGINS } = GAME_CANVAS;
    const topMargin = MARGINS.TOP;
    const bottomMargin = MARGINS.BOTTOM;
    const leftMargin = MARGINS.LEFT;
    const rightMargin = MARGINS.RIGHT;
    
    const graphHeight = DEFAULT_HEIGHT - bottomMargin - topMargin;
    const graphWidth = DEFAULT_WIDTH - leftMargin - rightMargin;
    
    const currentProgress = (currentMultiplier - 1) / Math.max(0.1, crashPoint - 1);
    const points = [];
    
    // Calculate points along the future trajectory
    for (let i = 0; i < 10; i++) {
      const futureProgress = currentProgress + (i / 20) * (1 - currentProgress);
      if (futureProgress >= 1) break; // Don't predict beyond crash point
      
      const normalizedProgress = Math.min(1, Math.max(0, futureProgress));
      const curveSteepness = 0.5;
      
      const x = leftMargin + normalizedProgress * graphWidth;
      const baseY = graphHeight - Math.pow(normalizedProgress, curveSteepness) * graphHeight;
      const y = topMargin + baseY;
      
      points.push({ x, y });
    }
    
    return points;
  }, [isGameActive, crashPoint]);

  return {
    canvasRef,
    planeImageRef,
    animationFrameId,
    lastTimestamp,
    currentPlanePos,
    pathPointsRef,
    verticalOffsetRef,
    flyAwayStartTime,
    startAnimationTime,
    backgroundPlanesRef,
    initBackgroundPlanes,
    calculateTrajectoryPoints
  };
};
