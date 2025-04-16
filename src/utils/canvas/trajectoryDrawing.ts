
import { GAME_COLORS, TRAJECTORY } from '@/constants/gameConstants';

export const drawTrajectory = (
  ctx: CanvasRenderingContext2D,
  currentX: number,
  currentY: number,
  multiplier: number,
  crashPoint: number,
  width: number,
  height: number,
  topMargin: number,
  bottomMargin: number,
  leftMargin: number,
  rightMargin: number
) => {
  if (!multiplier || multiplier < 1) return;
  
  const { TRAJECTORY_LINE } = GAME_COLORS;
  const { SHOW_PREDICTION, PREDICTION_POINTS, PREDICTION_OPACITY, DOT_SIZE, DOT_SPACING } = TRAJECTORY;
  
  if (!SHOW_PREDICTION) return;
  
  const graphHeight = height - bottomMargin - topMargin;
  const graphWidth = width - leftMargin - rightMargin;
  
  // Draw dots along path to show trajectory
  ctx.save();
  ctx.globalAlpha = PREDICTION_OPACITY;
  ctx.fillStyle = TRAJECTORY_LINE;
  
  const currentProgress = (multiplier - 1) / Math.max(0.1, (crashPoint - 1));
  let predictivePoints = [];
  
  // Calculate future trajectory points
  for (let i = 1; i <= PREDICTION_POINTS; i++) {
    const pointProgress = currentProgress + (i / PREDICTION_POINTS) * (1 - currentProgress);
    if (pointProgress >= 1) break; // Don't predict beyond crash point
    
    const normalizedProgress = Math.min(1, Math.max(0, pointProgress));
    const curveSteepness = 0.5;
    
    const projectedX = leftMargin + normalizedProgress * graphWidth;
    const baseY = graphHeight - Math.pow(normalizedProgress, curveSteepness) * graphHeight;
    const projectedY = topMargin + baseY;
    
    predictivePoints.push({ x: projectedX, y: projectedY });
  }
  
  // Draw dotted trajectory line
  if (predictivePoints.length > 1) {
    ctx.beginPath();
    ctx.setLineDash([DOT_SIZE, DOT_SPACING]);
    ctx.moveTo(currentX, currentY);
    
    predictivePoints.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    
    ctx.strokeStyle = TRAJECTORY_LINE;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw endpoint marker
    if (predictivePoints.length > 0) {
      const lastPoint = predictivePoints[predictivePoints.length - 1];
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
};
