
import { DrawConfig } from './types';

export const drawGrid = ({ ctx, width, height, bottomMargin, topMargin, leftMargin, rightMargin }: DrawConfig) => {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 0.5;
  
  // Draw vertical lines
  for (let x = leftMargin; x <= width - rightMargin; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, topMargin);
    ctx.lineTo(x, height - bottomMargin);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = topMargin; y <= height - bottomMargin; y += 50) {
    ctx.beginPath();
    ctx.moveTo(leftMargin, y);
    ctx.lineTo(width - rightMargin, y);
    ctx.stroke();
  }
};
