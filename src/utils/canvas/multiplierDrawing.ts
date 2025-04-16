
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
  const pixelRatio = window.devicePixelRatio || 1;
  const crashed = !isGameActive && multiplier >= crashPoint;
  
  // Set font properties with pixel ratio for crispness
  const fontSize = 48 * pixelRatio;
  ctx.font = `bold ${fontSize / pixelRatio}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (isGameActive) {
    // Dynamic color gradient based on multiplier value
    const hue = Math.max(0, Math.min(120, 120 - (multiplier - 1) * 10));
    const saturation = Math.min(100, 60 + (multiplier - 1) * 5);
    const lightness = Math.max(40, 60 - (multiplier - 1) * 2);
    
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } else {
    ctx.fillStyle = crashed ? '#FF5252' : '#FFFFFF';
  }
  
  // Add glow effect
  ctx.shadowColor = crashed ? 'rgba(255, 82, 82, 0.8)' : 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15 * pixelRatio;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  if (isGameActive && startAnimationTime !== null) {
    // Entrance animation
    const introProgress = Math.min(1, (timestamp - startAnimationTime) / 1000);
    const easeOutProgress = 1 - Math.pow(1 - introProgress, 3); // Cubic ease out
    const scaleFactor = 1 + (1 - easeOutProgress) * 0.5;
    const opacity = easeOutProgress;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.fillText(`${multiplier.toFixed(2)}x`, 0, 0);
    ctx.restore();
  } else {
    const displayMultiplier = crashed ? crashPoint : multiplier;
    
    if (isGameActive && multiplier > 2) {
      // Dynamic pulse effect that increases with multiplier
      const pulseSpeed = 100 + multiplier * 50;
      const pulseIntensity = 0.05 + (multiplier - 2) * 0.02;
      const pulseFactor = 1 + pulseIntensity * Math.sin(timestamp / pulseSpeed);
      
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(pulseFactor, pulseFactor);
      
      // Add a subtle rotation for higher multipliers
      if (multiplier > 5) {
        const wobbleAmount = (multiplier - 5) * 0.001;
        ctx.rotate(Math.sin(timestamp / 200) * wobbleAmount);
      }
      
      ctx.fillText(`${displayMultiplier.toFixed(2)}x`, 0, 0);
      ctx.restore();
    } else {
      // Standard display
      ctx.fillText(`${displayMultiplier.toFixed(2)}x`, width / 2, height / 2);
    }
  }

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Show crash message
  if (crashed) {
    ctx.fillStyle = '#FF5252';
    ctx.font = `bold ${36 / pixelRatio}px Arial, sans-serif`;
    ctx.fillText(`CRASHED @ ${crashPoint.toFixed(2)}x`, width / 2, height / 2 + 50);
    
    // Add explosive effect on crash
    const explosionSize = 70 + Math.sin(timestamp / 200) * 10;
    ctx.beginPath();
    
    // Create spiky explosion shape
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const spikeLength = explosionSize * (0.7 + 0.3 * Math.random());
      const x = width / 2 + Math.cos(angle) * spikeLength;
      const y = height / 2 + Math.sin(angle) * spikeLength;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Add intermediate points for spikes
      const midAngle = ((i + 0.5) / 16) * Math.PI * 2;
      const midSpikeLength = explosionSize * 0.5 * (0.7 + 0.3 * Math.random());
      const midX = width / 2 + Math.cos(midAngle) * midSpikeLength;
      const midY = height / 2 + Math.sin(midAngle) * midSpikeLength;
      
      ctx.lineTo(midX, midY);
    }
    
    ctx.closePath();
    
    const explosionGradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, explosionSize
    );
    explosionGradient.addColorStop(0, 'rgba(255, 87, 34, 0.8)');
    explosionGradient.addColorStop(0.7, 'rgba(255, 87, 34, 0.3)');
    explosionGradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
    
    ctx.fillStyle = explosionGradient;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
};
