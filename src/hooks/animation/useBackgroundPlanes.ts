
import { useRef, useCallback } from 'react';
import { GAME_CANVAS } from '@/constants/gameConstants';

interface BackgroundPlane {
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  opacity: number;
}

export const useBackgroundPlanes = () => {
  const backgroundPlanesRef = useRef<BackgroundPlane[]>([]);
  
  const initBackgroundPlanes = useCallback(() => {
    const { DEFAULT_WIDTH, DEFAULT_HEIGHT } = GAME_CANVAS;
    const planeCount = 10; // Increased plane count for richer background
    
    backgroundPlanesRef.current = Array.from({ length: planeCount }, () => {
      const size = 15 + Math.random() * 15; // Varied sizes
      const opacity = 0.05 + Math.random() * 0.15; // Subtle opacity variation
      const speed = 0.2 + Math.random() * 0.4; // Varied speeds
      
      return {
        x: Math.random() * DEFAULT_WIDTH,
        y: Math.random() * DEFAULT_HEIGHT,
        angle: Math.random() * Math.PI * 2,
        speed,
        size,
        opacity
      };
    });
  }, []);

  return {
    backgroundPlanesRef,
    initBackgroundPlanes
  };
};
