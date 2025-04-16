
export const drawBackgroundPlanes = (
  ctx: CanvasRenderingContext2D,
  planeImage: HTMLImageElement,
  planes: { x: number; y: number; angle: number; speed: number; size: number; opacity: number }[],
  timestamp: number,
  width: number,
  height: number
) => {
  const pixelRatio = window.devicePixelRatio || 1;
  
  planes.forEach((plane, index) => {
    const alignedX = Math.round(plane.x * pixelRatio) / pixelRatio;
    const alignedY = Math.round(plane.y * pixelRatio) / pixelRatio;
    
    // Create subtle pulsating effect
    const pulseAmount = 0.02;
    const pulseSpeed = 2000 + index * 500;
    const pulseOpacity = plane.opacity * (1 + pulseAmount * Math.sin(timestamp / pulseSpeed));
    
    ctx.save();
    ctx.globalAlpha = pulseOpacity;
    ctx.translate(alignedX, alignedY);
    ctx.rotate(plane.angle);
    
    // Draw plane with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      planeImage, 
      -plane.size / 2, 
      -plane.size / 2 * (planeImage.height / planeImage.width), 
      plane.size, 
      plane.size * (planeImage.height / planeImage.width)
    );
    
    // Add subtle trail for background planes
    if (index % 3 === 0) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-plane.size, plane.size / 6);
      ctx.lineTo(-plane.size, -plane.size / 6);
      ctx.closePath();
      
      const trailGradient = ctx.createLinearGradient(-plane.size, 0, 0, 0);
      trailGradient.addColorStop(0, 'rgba(255, 152, 0, 0)');
      trailGradient.addColorStop(1, `rgba(255, 152, 0, ${pulseOpacity * 0.5})`);
      
      ctx.fillStyle = trailGradient;
      ctx.fill();
    }
    
    ctx.restore();
    
    // Update plane position
    const newX = alignedX + Math.cos(plane.angle) * plane.speed;
    const newY = alignedY + Math.sin(plane.angle) * plane.speed;
    
    // Wrap around edges
    let nextX = newX;
    let nextY = newY;
    
    if (nextX < -plane.size) nextX = width + plane.size;
    if (nextX > width + plane.size) nextX = -plane.size;
    if (nextY < -plane.size) nextY = height + plane.size;
    if (nextY > height + plane.size) nextY = -plane.size;
    
    planes[index] = {
      ...plane,
      x: nextX,
      y: nextY
    };
  });
};
