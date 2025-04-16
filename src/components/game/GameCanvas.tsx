
import React, { useEffect, useRef } from 'react';
import { useGameAnimation } from '@/hooks/useGameAnimation';
import { useGameCountdown } from '@/hooks/useGameCountdown';
import CountdownDisplay from './CountdownDisplay';
import aviatorSvg from '/images/aviator.svg';

interface GameCanvasProps {
  isGameActive: boolean;
  multiplier: number;
  crashPoint: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ isGameActive, multiplier, crashPoint }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
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
    isFlyingAway,
    setIsFlyingAway,
    draw
  } = useGameAnimation({ 
    isGameActive, 
    multiplier, 
    crashPoint 
  });

  const handleCountdownComplete = () => {
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

  // Reset animation state when game starts/ends
  useEffect(() => {
    if (isGameActive) {
      // Reset for new game
      pathPointsRef.current = [];
      currentPlanePos.current = { x: -50, y: 400, angle: 0 };
      verticalOffsetRef.current = 0;
      lastTimestamp.current = performance.now();
      setIsFlyingAway(false);
      flyAwayStartTime.current = null;
      startAnimationTime.current = performance.now();
    } else {
      // Handle game end - initiate fly away if crashed
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

  // Canvas resize handler for better responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      // Set canvas display size to match container
      const container = containerRef.current;
      const canvas = canvasRef.current;
      
      // Get the container's dimensions
      const rect = container.getBoundingClientRect();
      const displayWidth = rect.width;
      const displayHeight = rect.height;
      
      // Update canvas CSS dimensions
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      
      // Force redraw on next animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(draw);
      }
    };
    
    // Initial resize
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [draw]);

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video w-full glass-panel overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      {!isGameActive && <CountdownDisplay countdown={countdown} />}
    </div>
  );
};

export default GameCanvas;
