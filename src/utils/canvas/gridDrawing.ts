
import { DrawConfig } from './types';

export const drawGrid = ({ ctx, width, height, bottomMargin, topMargin, leftMargin, rightMargin }: DrawConfig) => {
  // Use device pixel ratio for crisp lines
  const pixelRatio = window.devicePixelRatio || 1;
  const gridColor = 'rgba(255, 255, 255, 0.1)';
  
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5 * pixelRatio;
  
  // Draw vertical lines with pixel-perfect positioning
  for (let x = leftMargin; x <= width - rightMargin; x += 50) {
    const alignedX = Math.floor(x * pixelRatio) / pixelRatio;
    
    ctx.beginPath();
    ctx.moveTo(alignedX, topMargin);
    ctx.lineTo(alignedX, height - bottomMargin);
    ctx.stroke();
  }
  
  // Draw horizontal lines with pixel-perfect positioning
  for (let y = topMargin; y <= height - bottomMargin; y += 50) {
    const alignedY = Math.floor(y * pixelRatio) / pixelRatio;
    
    ctx.beginPath();
    ctx.moveTo(leftMargin, alignedY);
    ctx.lineTo(width - rightMargin, alignedY);
    ctx.stroke();
  }
};
