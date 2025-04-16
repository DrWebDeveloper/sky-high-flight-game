
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
    
    // Create a more attractive gradient for the filled area
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(255, 87, 34, 0.7)'); // More vibrant orange/red
    gradient.addColorStop(1, 'rgba(255, 87, 34, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw glowing path line
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    pathPoints.forEach((p, index) => {
      if (index > 0) ctx.lineTo(p.x, p.y);
    });
    
    // Create a more vibrant glowing path
    const gradient2 = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gradient2.addColorStop(0, '#FFC107'); // Amber
    gradient2.addColorStop(1, '#FF9800'); // Orange
    ctx.strokeStyle = gradient2;
    ctx.lineWidth = 4;
    
    // Add shadow for glow effect
    ctx.shadowColor = 'rgba(255, 193, 7, 0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
};

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
  const planeWidth = 60; // Slightly larger plane
  const planeHeight = 60 * (planeImage.height / planeImage.width);
  
  // Add a glow effect when the game is active
  if (isGameActive && startAnimationTime === null) {
    ctx.save();
    
    // Intensity based on multiplier
    const glowIntensity = Math.min(15 + (multiplier - 1) * 5, 30);
    
    ctx.shadowColor = '#FF9800';
    ctx.shadowBlur = glowIntensity;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Draw plane with proper colors
  ctx.drawImage(planeImage, -planeWidth / 2, -planeHeight / 2, planeWidth, planeHeight);
  
  // Draw a small trail behind the plane
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
  
  // Set text color based on game state and multiplier value
  if (isGameActive) {
    // Create a gradient based on multiplier
    const hue = Math.min(120 - (multiplier - 1) * 20, 120); // Green to red
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
  } else {
    ctx.fillStyle = crashed ? '#FF5252' : '#FFFFFF';
  }
  
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add shadow for better contrast
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
    
    // Add a pulsing effect for high multipliers when game is active
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

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  if (crashed) {
    ctx.fillStyle = '#FF5252';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`CRASHED @ ${crashPoint.toFixed(2)}x`, width / 2, height / 2 + 50);
  }
};

// Add a new function to draw background planes for ambience
export const drawBackgroundPlanes = (
  ctx: CanvasRenderingContext2D,
  planeImage: HTMLImageElement,
  planes: { x: number; y: number; angle: number }[],
  timestamp: number,
  width: number,
  height: number
) => {
  planes.forEach((plane, index) => {
    const size = 20 + (index % 3) * 5; // Varied sizes
    const opacity = 0.1 + (index % 5) * 0.03; // Varied opacity
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(plane.x, plane.y);
    ctx.rotate(plane.angle);
    ctx.drawImage(planeImage, -size/2, -size/2, size, size * (planeImage.height / planeImage.width));
    ctx.restore();
    
    // Update position for next frame
    planes[index] = {
      x: (plane.x + Math.cos(plane.angle) * 0.5) % width,
      y: (plane.y + Math.sin(plane.angle) * 0.5) % height,
      angle: plane.angle
    };
    
    // Wrap around screen
    if (planes[index].x < 0) planes[index].x = width;
    if (planes[index].y < 0) planes[index].y = height;
  });
};
