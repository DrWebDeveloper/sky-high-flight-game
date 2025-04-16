
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
  
  if (isGameActive) {
    // Adjust color gradient to handle higher multipliers
    const hue = Math.max(0, Math.min(120, 120 - (multiplier - 1) * 10));
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
  } else {
    ctx.fillStyle = crashed ? '#FF5252' : '#FFFFFF';
  }
  
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
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
    
    if (isGameActive && multiplier > 2) {
      const pulseFactor = 1 + 0.05 * Math.sin(timestamp / 200);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(pulseFactor, pulseFactor);
      ctx.fillText(`${displayMultiplier.toFixed(2)}x`, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(`${displayMultiplier.toFixed(2)}x`, width / 2, height / 2);
    }
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  if (crashed) {
    ctx.fillStyle = '#FF5252';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`CRASHED @ ${crashPoint.toFixed(2)}x`, width / 2, height / 2 + 50);
  }
};
