
import { useCallback } from 'react';
import { GAME_CANVAS } from '@/constants/gameConstants';

export const useTrajectory = (isGameActive: boolean, crashPoint: number) => {
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

  return { calculateTrajectoryPoints };
};
