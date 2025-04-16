
interface DrawConfig {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  bottomMargin: number;
  topMargin: number;
  leftMargin: number;
  rightMargin: number;
}

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

export const drawPath = (
  ctx: CanvasRenderingContext2D,
  pathPoints: { x: number; y: number }[],
  height: number,
  bottomMargin: number
) => {
  if (pathPoints.length > 1) {
    // Draw filled area
    ctx.beginPath();
    const firstPoint = pathPoints[0];
    ctx.moveTo(firstPoint.x, height - bottomMargin);
    
    pathPoints.forEach(p => {
      ctx.lineTo(p.x, p.y);
    });
    
    const finalPathX = pathPoints[pathPoints.length - 1].x;
    const finalPathY = pathPoints[pathPoints.length - 1].y;
    ctx.lineTo(finalPathX, finalPathY);
    ctx.lineTo(finalPathX, height - bottomMargin);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw yellow path line
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    pathPoints.forEach((p, index) => {
      if (index > 0) ctx.lineTo(p.x, p.y);
    });
    
    const gradient2 = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gradient2.addColorStop(0, '#FFC700');
    gradient2.addColorStop(1, '#FFD700');
    ctx.strokeStyle = gradient2;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
};

export const drawPlane = (
  ctx: CanvasRenderingContext2D,
  planeImage: HTMLImageElement,
  x: number,
  y: number,
  angle: number,
  isGameActive: boolean,
  startAnimationTime: number | null
) => {
  const planeWidth = 50;
  const planeHeight = 50 * (planeImage.height / planeImage.width);
  
  if (isGameActive && startAnimationTime === null) {
    ctx.save();
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(planeImage, -planeWidth / 2, -planeHeight / 2, planeWidth, planeHeight);
  ctx.restore();
  
  if (isGameActive && startAnimationTime === null) {
    ctx.restore();
  }
};

export const drawMultiplier = (
  ctx: CanvasRenderingContext2D,
  multiplier: number,
  crashPoint: number,
  isGameActive: boolean,
  startAnimationTime: number | null,
  timestamp: number,
  width: number,
  height: number
) => {
  const crashed = !isGameActive && multiplier >= crashPoint;
  ctx.fillStyle = isGameActive ? '#90EE90' : (crashed ? '#FF6B6B' : '#FFFFFF');
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (isGameActive && startAnimationTime !== null) {
    const introProgress = Math.min(1, (timestamp - startAnimationTime) / 1000);
    const scaleFactor = 1 + (1 - introProgress) * 0.5;
    
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.fillText(`${multiplier.toFixed(2)}x`, 0, 0);
    ctx.restore();
  } else {
    const displayMultiplier = crashed ? crashPoint : multiplier;
    ctx.fillText(`${displayMultiplier.toFixed(2)}x`, width / 2, height / 2);
  }

  if (crashed) {
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`CRASHED @ ${crashPoint.toFixed(2)}x`, width / 2, height / 2 + 50);
  }
};
