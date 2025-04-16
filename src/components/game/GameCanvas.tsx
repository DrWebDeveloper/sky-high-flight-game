
import React, { useEffect } from 'react';
import { useGameAnimation } from '@/hooks/useGameAnimation';
import { useGameCountdown } from '@/hooks/useGameCountdown';
import CountdownDisplay from './CountdownDisplay';
import aviatorSvg from '/images/aviator.svg';
import { drawGrid, drawPath, drawPlane, drawMultiplier, drawBackgroundPlanes, drawTrajectory } from '@/utils/canvas';

interface GameCanvasProps {
  isGameActive: boolean;
  multiplier: number;
  crashPoint: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ isGameActive, multiplier, crashPoint }) => {
  const {
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
  } = useGameAnimation({ 
    isGameActive, 
    multiplier, 
    crashPoint 
  });

  const handleCountdownComplete = () => {
    // This would typically call startNewGame from the parent
    console.log("Countdown complete");
  };

  const countdown = useGameCountdown({
    isGameActive,
    onCountdownComplete: handleCountdownComplete
  });

  // Load plane image
  useEffect(() => {
    console.log("Loading plane image");
    const img = new Image();
    img.src = aviatorSvg;
    img.onload = () => {
      console.log("Plane image loaded successfully");
      planeImageRef.current = img;
      initBackgroundPlanes();
    };
    img.onerror = (e) => {
      console.error("Error loading plane image:", e);
    };
  }, [initBackgroundPlanes]);

  // Reset path and position when game becomes active
  useEffect(() => {
    if (isGameActive) {
      pathPointsRef.current = [];
      currentPlanePos.current = { x: -50, y: 400, angle: 0 };
      verticalOffsetRef.current = 0;
      lastTimestamp.current = performance.now();
      setIsFlyingAway(false);
      flyAwayStartTime.current = null;
      startAnimationTime.current = performance.now();
    } else {
      if (multiplier >= crashPoint && !isFlyingAway) {
        setIsFlyingAway(true);
        flyAwayStartTime.current = performance.now();
      }
    }
  }, [isGameActive, multiplier, crashPoint, isFlyingAway, setIsFlyingAway]);

  // Animation frame effect
  useEffect(() => {
    if (!animationFrameId.current) {
      lastTimestamp.current = performance.now();
      animationFrameId.current = requestAnimationFrame(draw);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [draw]);

  return (
    <div className="relative aspect-video w-full glass-panel overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="absolute top-0 left-0 w-full h-full"
      />
      {!isGameActive && <CountdownDisplay countdown={countdown} />}
    </div>
  );
};

export default GameCanvas;
