
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
  const pixelRatio = window.devicePixelRatio || 1;
  const planeWidth = 60;
  const planeHeight = 40;
  
  // Align coordinates for pixel-perfect rendering
  const alignedX = Math.round(x * pixelRatio) / pixelRatio;
  const alignedY = Math.round(y * pixelRatio) / pixelRatio;
  
  // Add glow effect based on multiplier
  if (isGameActive && startAnimationTime === null) {
    ctx.save();
    // Increase glow intensity with multiplier
    const glowIntensity = Math.min(15 + (multiplier - 1) * 7, 35);
    ctx.shadowColor = multiplier > 2 ? '#FF5722' : '#FF9800';
    ctx.shadowBlur = glowIntensity;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  ctx.save();
  ctx.translate(alignedX, alignedY);
  ctx.rotate(angle);
  
  // Draw plane with high quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(planeImage, -planeWidth / 2, -planeHeight / 2, planeWidth, planeHeight);
  
  // Add flame trail that grows with multiplier
  if (isGameActive && startAnimationTime === null && multiplier > 1.1) {
    const trailLength = Math.min(planeWidth + (multiplier - 1) * 20, planeWidth * 3);
    const trailWidth = planeHeight / 2 + (multiplier - 1) * 5;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-trailLength, trailWidth / 2);
    ctx.lineTo(-trailLength, -trailWidth / 2);
    ctx.closePath();
    
    // Create dynamic trail gradient based on multiplier
    const trailGradient = ctx.createLinearGradient(-trailLength, 0, 0, 0);
    trailGradient.addColorStop(0, 'rgba(255, 87, 34, 0)');
    trailGradient.addColorStop(0.4, 'rgba(255, 152, 0, 0.2)');
    trailGradient.addColorStop(0.8, 'rgba(255, 193, 7, 0.5)');
    trailGradient.addColorStop(1, 'rgba(255, 235, 59, 0.7)');
    
    ctx.fillStyle = trailGradient;
    ctx.fill();
    
    // Add particle effects for higher multipliers
    if (multiplier > 2) {
      const particleCount = Math.floor((multiplier - 1) * 3);
      for (let i = 0; i < particleCount; i++) {
        const particleX = -planeWidth / 2 - Math.random() * trailLength;
        const particleY = (Math.random() - 0.5) * trailWidth;
        const particleSize = 2 + Math.random() * 4;
        
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${Math.floor(150 + Math.random() * 100)}, 0, ${0.3 + Math.random() * 0.5})`;
        ctx.fill();
      }
    }
  }
  
  ctx.restore();
  
  if (isGameActive && startAnimationTime === null) {
    ctx.restore();
  }
};
