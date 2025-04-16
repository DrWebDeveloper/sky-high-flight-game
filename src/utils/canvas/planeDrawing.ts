
export const drawPlane = (
  ctx: CanvasRenderingContext2D,
  planeImage: HTMLImageElement,
  x: number,
  y: number,
  angle: number,
  isGameActive: boolean,
  startAnimationTime: number | null,
  multiplier: number
) => {
  const planeWidth = 60;
  const planeHeight = 40;
  
  if (isGameActive && startAnimationTime === null) {
    ctx.save();
    const glowIntensity = Math.min(15 + (multiplier - 1) * 5, 30);
    ctx.shadowColor = '#FF9800';
    ctx.shadowBlur = glowIntensity;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#E50539';
  ctx.drawImage(planeImage, -planeWidth / 2, -planeHeight / 2, planeWidth, planeHeight);
  
  if (isGameActive && startAnimationTime === null && multiplier > 1.1) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-planeWidth, planeHeight / 4);
    ctx.lineTo(-planeWidth, -planeHeight / 4);
    ctx.closePath();
    
    const trailGradient = ctx.createLinearGradient(-planeWidth, 0, 0, 0);
    trailGradient.addColorStop(0, 'rgba(255, 152, 0, 0)');
    trailGradient.addColorStop(1, 'rgba(255, 152, 0, 0.7)');
    ctx.fillStyle = trailGradient;
    ctx.fill();
  }
  
  ctx.restore();
  
  if (isGameActive && startAnimationTime === null) {
    ctx.restore();
  }
};
