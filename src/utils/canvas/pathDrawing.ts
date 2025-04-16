
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
