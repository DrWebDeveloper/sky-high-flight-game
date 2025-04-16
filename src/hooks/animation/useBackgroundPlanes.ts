
import { useRef, useCallback } from 'react';
import { GAME_CANVAS } from '@/constants/gameConstants';

interface PlanePosition {
  x: number;
  y: number;
  angle: number;
}

export const useBackgroundPlanes = () => {
  const backgroundPlanesRef = useRef<PlanePosition[]>([]);
  
  const initBackgroundPlanes = useCallback(() => {
    const { DEFAULT_WIDTH, DEFAULT_HEIGHT } = GAME_CANVAS;
    
    backgroundPlanesRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * DEFAULT_WIDTH,
      y: Math.random() * DEFAULT_HEIGHT,
      angle: Math.random() * Math.PI * 2,
    }));
  }, []);

  return {
    backgroundPlanesRef,
    initBackgroundPlanes
  };
};
