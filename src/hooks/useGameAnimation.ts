
import { useRef, useCallback } from 'react';

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

  return {
    canvasRef,
    planeImageRef,
    animationFrameId,
    lastTimestamp,
    currentPlanePos,
    pathPointsRef,
    verticalOffsetRef,
    flyAwayStartTime,
    startAnimationTime
  };
};
