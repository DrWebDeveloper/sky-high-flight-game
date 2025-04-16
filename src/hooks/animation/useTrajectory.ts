
import { useCallback } from 'react';

export const useTrajectory = (isGameActive: boolean, crashPoint: number) => {
  const calculateTrajectoryPoints = useCallback((
    multiplier: number,
    currentX: number,
    currentY: number,
    width: number,
    height: number,
    topMargin: number,
    bottomMargin: number,
    leftMargin: number,
    rightMargin: number
  ) => {
    if (!isGameActive || multiplier < 1) return [];
    
    const graphHeight = height - bottomMargin - topMargin;
    const graphWidth = width - leftMargin - rightMargin;
    
    const currentProgress = (multiplier - 1) / Math.max(0.1, (crashPoint - 1));
    let points = [];
    
    // Calculate future trajectory points
    for (let i = 1; i <= 20; i++) {
      const pointProgress = currentProgress + (i / 20) * (1 - currentProgress);
      if (pointProgress >= 1) break; // Don't predict beyond crash point
      
      const normalizedProgress = Math.min(1, Math.max(0, pointProgress));
      const curveSteepness = 0.5;
      
      const projectedX = leftMargin + normalizedProgress * graphWidth;
      const baseY = graphHeight - Math.pow(normalizedProgress, curveSteepness) * graphHeight;
      const projectedY = topMargin + baseY;
      
      points.push({ x: projectedX, y: projectedY });
    }
    
    return points;
  }, [isGameActive, crashPoint]);

  return { calculateTrajectoryPoints };
};
