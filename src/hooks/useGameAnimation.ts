
import { useRef, useCallback, useState, useEffect } from 'react';
import { usePlanePosition } from './animation/usePlanePosition';
import { useAnimationTiming } from './animation/useAnimationTiming';
import { useBackgroundPlanes } from './animation/useBackgroundPlanes';
import { drawGrid, drawPath, drawPlane, drawMultiplier, drawBackgroundPlanes } from '@/utils/canvas';
import { GAME_CANVAS } from '@/constants/gameConstants';

interface GameAnimationProps {
  isGameActive: boolean;
  multiplier: number;
  crashPoint: number;
}

export const useGameAnimation = ({ isGameActive, multiplier, crashPoint }: GameAnimationProps) => {
  const [isFlyingAway, setIsFlyingAway] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeImageRef = useRef<HTMLImageElement | null>(null);
  const pixelRatioRef = useRef<number>(1);
  
  const {
    currentPlanePos,
    pathPointsRef,
    verticalOffsetRef,
    targetAngleRef,
    updatePlanePosition,
    updatePlaneAngle,
    addPathPoint
  } = usePlanePosition();
  
  const { animationFrameId, lastTimestamp, flyAwayStartTime, startAnimationTime } = useAnimationTiming();
  const { backgroundPlanesRef, initBackgroundPlanes } = useBackgroundPlanes();

  // Handle pixel ratio changes for sharp rendering
  useEffect(() => {
    const updatePixelRatio = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Get current pixel ratio
      pixelRatioRef.current = window.devicePixelRatio || 1;
      
      // Get current canvas display size
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      // Adjust canvas dimensions for pixel ratio
      canvas.width = displayWidth * pixelRatioRef.current;
      canvas.height = displayHeight * pixelRatioRef.current;
      
      // Scale all drawing operations by the device pixel ratio
      ctx.scale(pixelRatioRef.current, pixelRatioRef.current);
      
      // Reset CSS width/height to match display size
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
    };
    
    // Update on init and when window resizes
    updatePixelRatio();
    
    window.addEventListener('resize', updatePixelRatio);
    
    return () => {
      window.removeEventListener('resize', updatePixelRatio);
    };
  }, []);

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const planeImage = planeImageRef.current;
    
    if (!canvas) {
      animationFrameId.current = requestAnimationFrame(draw);
      return;
    }
    
    if (!planeImage) {
      animationFrameId.current = requestAnimationFrame(draw);
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      console.error("Could not get 2D context");
      return;
    }

    const rawDeltaTime = (timestamp - lastTimestamp.current) / 1000;
    lastTimestamp.current = timestamp;
    const deltaTime = Math.min(rawDeltaTime, 0.1); // Cap delta time

    // Get display dimensions
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    // Get canvas internal dimensions (scaled by pixel ratio)
    const { width, height } = canvas;
    
    // Use display dimensions for calculations
    const { TOP: topMargin, BOTTOM: bottomMargin, LEFT: leftMargin, RIGHT: rightMargin } = GAME_CANVAS.MARGINS;
    const graphHeight = displayHeight - bottomMargin - topMargin;
    const graphWidth = displayWidth - leftMargin - rightMargin;

    // Clear with better performance
    ctx.fillStyle = '#1A1F2C';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    
    // Draw background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, displayHeight);
    bgGradient.addColorStop(0, 'rgba(20, 20, 40, 0.3)');
    bgGradient.addColorStop(1, 'rgba(10, 10, 20, 0.3)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    
    // Draw grid
    drawGrid({ 
      ctx, 
      width: displayWidth, 
      height: displayHeight, 
      bottomMargin, 
      topMargin, 
      leftMargin, 
      rightMargin 
    });
    
    // Draw background planes
    if (backgroundPlanesRef.current.length > 0) {
      drawBackgroundPlanes(
        ctx, 
        planeImage, 
        backgroundPlanesRef.current, 
        timestamp, 
        displayWidth, 
        displayHeight
      );
    }

    let nextX = currentPlanePos.current.x;
    let nextY = currentPlanePos.current.y;
    let angle = currentPlanePos.current.angle;

    if (isFlyingAway && flyAwayStartTime.current) {
      // Fly away animation when plane crashes
      const flyAwayDuration = timestamp - flyAwayStartTime.current;
      const flyAwaySpeed = 100 + flyAwayDuration / 15; // Increased speed
      const flyAwayAngle = currentPlanePos.current.angle;

      // Update position with custom fly away physics
      nextX += Math.cos(flyAwayAngle) * flyAwaySpeed * deltaTime;
      nextY += Math.sin(flyAwayAngle) * flyAwaySpeed * deltaTime - 10 * deltaTime;
      angle = flyAwayAngle;
      
      // Update for next frame
      currentPlanePos.current = { x: nextX, y: nextY, angle };
      
    } else if (isGameActive) {
      if (startAnimationTime.current !== null) {
        // Entrance animation
        const introAnimDuration = (timestamp - startAnimationTime.current) / 1000;
        const introAnimComplete = introAnimDuration > 1.5;
        
        if (!introAnimComplete) {
          // Use cubic ease-out for smooth entrance
          const entranceProgress = Math.min(1, introAnimDuration / 1.5);
          const easedProgress = 1 - Math.pow(1 - entranceProgress, 3);
          
          // Calculate entrance path
          nextX = -50 + (leftMargin + 50) * easedProgress;
          nextY = displayHeight - bottomMargin - 20;
          angle = -0.1;
          
          // Add to path
          addPathPoint(nextX, nextY);
          
          // Update position
          currentPlanePos.current = { x: nextX, y: nextY, angle };
        } else {
          // Complete entrance animation
          startAnimationTime.current = null;
          
          // Ensure we have a starting point
          if (pathPointsRef.current.length === 0) {
            addPathPoint(leftMargin, displayHeight - bottomMargin - 20);
          }
        }
      } else {
        // Main flight animation
        const baseMultiplier = multiplier - 1;
        const maxMultiplier = crashPoint > 1 ? crashPoint - 1 : 10;
        
        // Use improved curve calculation
        const rawProgress = baseMultiplier / Math.max(0.1, maxMultiplier);
        const curveExponent = 1.5; // Controls curve steepness
        const progress = Math.pow(rawProgress, curveExponent);
        const normalizedProgress = Math.min(1, Math.max(0, progress));

        // Add random vertical movement
        if (Math.random() < 0.05) {
          verticalOffsetRef.current = (Math.random() - 0.5) * 0.15;
        }

        // Calculate target position with improved curve
        const curveSteepness = 0.5;
        const targetX = leftMargin + normalizedProgress * graphWidth;
        const baseY = graphHeight - Math.pow(normalizedProgress, curveSteepness) * graphHeight;
        const targetY = topMargin + baseY + verticalOffsetRef.current * graphHeight;

        // Calculate target angle for plane
        if (pathPointsRef.current.length > 0) {
          const lastPoint = pathPointsRef.current[pathPointsRef.current.length - 1];
          const angleToTarget = Math.atan2(targetY - lastPoint.y, targetX - lastPoint.x);
          targetAngleRef.current = angleToTarget;
        }
        
        // Update plane position with smooth transition
        updatePlanePosition(targetX, targetY, deltaTime);
        updatePlaneAngle(targetAngleRef.current, deltaTime);
        
        // Update local variables for drawing
        nextX = currentPlanePos.current.x;
        nextY = currentPlanePos.current.y;
        angle = currentPlanePos.current.angle;
        
        // Add point to path with minimum distance check
        addPathPoint(nextX, nextY);
      }
    }

    // Draw flight path
    drawPath(ctx, pathPointsRef.current, displayHeight, bottomMargin);
    
    // Draw plane if it's within bounds
    if (!isFlyingAway || (nextX <= displayWidth + 50 && nextX >= -50 && nextY >= -50 && nextY <= displayHeight + 50)) {
      drawPlane(ctx, planeImage, nextX, nextY, angle, isGameActive, startAnimationTime.current, multiplier);
    }
    
    // Draw multiplier
    drawMultiplier(
      ctx, 
      multiplier, 
      crashPoint, 
      isGameActive, 
      startAnimationTime.current, 
      timestamp, 
      displayWidth, 
      displayHeight
    );

    // Continue animation loop
    if (animationFrameId.current !== null) {
      animationFrameId.current = requestAnimationFrame(draw);
    }
  }, [isGameActive, multiplier, crashPoint, isFlyingAway, addPathPoint, updatePlanePosition, updatePlaneAngle]);

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
    isFlyingAway,
    setIsFlyingAway,
    draw
  };
};
