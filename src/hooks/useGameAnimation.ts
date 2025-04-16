import { useRef, useCallback, useState } from 'react';
import { GAME_CANVAS } from '@/constants/gameConstants';
import { drawGrid, drawPath, drawPlane, drawMultiplier, drawBackgroundPlanes, drawTrajectory } from '@/utils/canvas';

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
  const [isFlyingAway, setIsFlyingAway] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);
  const currentPlanePos = useRef<PlanePosition>({ x: 50, y: 400, angle: 0 });
  const pathPointsRef = useRef<{ x: number; y: number }[]>([{ x: 50, y: 400 }]);
  const verticalOffsetRef = useRef(0);
  const flyAwayStartTime = useRef<number | null>(null);
  const startAnimationTime = useRef<number | null>(null);
  
  const backgroundPlanesRef = useRef<PlanePosition[]>([]);
  
  const initBackgroundPlanes = useCallback(() => {
    const { DEFAULT_WIDTH, DEFAULT_HEIGHT } = GAME_CANVAS;
    
    backgroundPlanesRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * DEFAULT_WIDTH,
      y: Math.random() * DEFAULT_HEIGHT,
      angle: Math.random() * Math.PI * 2,
    }));
  }, []);

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
    
    for (let i = 0; i < 10; i++) {
      const futureProgress = currentProgress + (i / 20) * (1 - currentProgress);
      if (futureProgress >= 1) break;
      
      const normalizedProgress = Math.min(1, Math.max(0, futureProgress));
      const curveSteepness = 0.5;
      
      const x = leftMargin + normalizedProgress * graphWidth;
      const baseY = graphHeight - Math.pow(normalizedProgress, curveSteepness) * graphHeight;
      const y = topMargin + baseY;
      
      points.push({ x, y });
    }
    
    return points;
  }, [isGameActive, crashPoint]);

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const planeImage = planeImageRef.current;
    
    if (!canvas) {
      console.log("Canvas not found");
      animationFrameId.current = requestAnimationFrame(draw);
      return;
    }
    
    if (!planeImage) {
      console.log("Plane image not loaded yet");
      animationFrameId.current = requestAnimationFrame(draw);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get 2D context");
      return;
    }

    const rawDeltaTime = (timestamp - lastTimestamp.current) / 1000;
    lastTimestamp.current = timestamp;
    const deltaTime = Math.min(rawDeltaTime, 0.1);

    const { width, height } = canvas;
    const { TOP: topMargin, BOTTOM: bottomMargin, LEFT: leftMargin, RIGHT: rightMargin } = GAME_CANVAS.MARGINS;
    const graphHeight = height - bottomMargin - topMargin;
    const graphWidth = width - leftMargin - rightMargin;

    ctx.clearRect(0, 0, width, height);
    
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(20, 20, 40, 0.3)');
    bgGradient.addColorStop(1, 'rgba(10, 10, 20, 0.3)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    drawGrid({ ctx, width, height, bottomMargin, topMargin, leftMargin, rightMargin });
    
    if (backgroundPlanesRef.current.length > 0) {
      drawBackgroundPlanes(ctx, planeImage, backgroundPlanesRef.current, timestamp, width, height);
    }

    let { x: nextX, y: nextY, angle } = currentPlanePos.current;

    if (isFlyingAway && flyAwayStartTime.current) {
      const flyAwayDuration = timestamp - flyAwayStartTime.current;
      const flyAwaySpeed = 100 + flyAwayDuration / 20;
      const flyAwayAngle = currentPlanePos.current.angle;

      nextX += Math.cos(flyAwayAngle) * flyAwaySpeed * deltaTime;
      nextY += Math.sin(flyAwayAngle) * flyAwaySpeed * deltaTime - 10 * deltaTime;
      angle = flyAwayAngle;
    } else if (isGameActive) {
      if (startAnimationTime.current !== null) {
        const introAnimDuration = (timestamp - startAnimationTime.current) / 1000;
        const introAnimComplete = introAnimDuration > 1.5;
        
        if (!introAnimComplete) {
          const entranceProgress = Math.min(1, introAnimDuration / 1.5);
          const easedProgress = 1 - Math.pow(1 - entranceProgress, 3);
          
          nextX = -50 + (leftMargin + 50) * easedProgress;
          nextY = height - bottomMargin - 20;
          angle = -0.1;
          
          if (Math.hypot(nextX - (pathPointsRef.current[pathPointsRef.current.length - 1]?.x || 0), 
                         nextY - (pathPointsRef.current[pathPointsRef.current.length - 1]?.y || 0)) > 5) {
            pathPointsRef.current.push({ x: nextX, y: nextY });
          }
          
          currentPlanePos.current = { x: nextX, y: nextY, angle };
        } else {
          startAnimationTime.current = null;
          if (pathPointsRef.current.length === 0) {
            pathPointsRef.current.push({ x: leftMargin, y: height - bottomMargin - 20 });
          }
        }
      } else {
        const rawProgress = (multiplier - 1) / Math.max(0.1, crashPoint > 1 ? crashPoint - 1 : 0.1);
        const progress = Math.pow(rawProgress, 1.5);
        const normalizedProgress = Math.min(1, Math.max(0, progress));

        if (Math.random() < 0.05) {
          verticalOffsetRef.current = (Math.random() - 0.5) * 0.15;
        }

        const curveSteepness = 0.5;
        const targetX = leftMargin + normalizedProgress * graphWidth;
        const baseY = graphHeight - Math.pow(normalizedProgress, curveSteepness) * graphHeight;
        const targetY = topMargin + baseY + verticalOffsetRef.current * graphHeight;

        const lerpFactor = Math.min(1, 3.0 * deltaTime);
        nextX = currentPlanePos.current.x + (targetX - currentPlanePos.current.x) * lerpFactor;
        nextY = currentPlanePos.current.y + (targetY - currentPlanePos.current.y) * lerpFactor;

        const lastPoint = pathPointsRef.current[pathPointsRef.current.length - 1];
        if (lastPoint && Math.hypot(nextX - lastPoint.x, nextY - lastPoint.y) > 3) {
          pathPointsRef.current.push({ x: nextX, y: nextY });
        }

        if (pathPointsRef.current.length >= 2) {
          const p1 = pathPointsRef.current[pathPointsRef.current.length - 2];
          const p2 = { x: nextX, y: nextY };
          if (Math.hypot(p2.x - p1.x, p2.y - p1.y) > 0.1) {
            const targetAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            let angleDiff = targetAngle - angle;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            
            angle += angleDiff * Math.min(1, 4.0 * deltaTime);
          }
        }
        currentPlanePos.current = { x: nextX, y: nextY, angle };
      }
    }

    drawPath(ctx, pathPointsRef.current, height, bottomMargin);
    
    if (isGameActive && startAnimationTime.current === null) {
      drawTrajectory(
        ctx, 
        nextX, 
        nextY, 
        multiplier, 
        crashPoint, 
        width, 
        height, 
        topMargin, 
        bottomMargin, 
        leftMargin, 
        rightMargin
      );
    }
    
    if (!isFlyingAway || (nextX <= width + 50 && nextX >= -50 && nextY >= -50 && nextY <= height + 50)) {
      drawPlane(ctx, planeImage, nextX, nextY, angle, isGameActive, startAnimationTime.current, multiplier);
    }
    
    drawMultiplier(ctx, multiplier, crashPoint, isGameActive, startAnimationTime.current, timestamp, width, height);

    if (animationFrameId.current !== null) {
      animationFrameId.current = requestAnimationFrame(draw);
    }
  }, [isGameActive, multiplier, crashPoint, isFlyingAway]);

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
    calculateTrajectoryPoints,
    isFlyingAway,
    setIsFlyingAway,
    draw
  };
};
