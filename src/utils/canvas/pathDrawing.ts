
export const drawPath = (
  ctx: CanvasRenderingContext2D,
  pathPoints: { x: number; y: number }[],
  height: number,
  bottomMargin: number
) => {
  if (pathPoints.length < 2) return;
  
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Draw filled area with smooth gradient
  ctx.beginPath();
  const firstPoint = pathPoints[0];
  ctx.moveTo(firstPoint.x, height - bottomMargin);
  
  // Use quadratic curves for smoother path
  pathPoints.forEach((point, index) => {
    if (index === 0) {
      ctx.lineTo(point.x, point.y);
    } else {
      const prevPoint = pathPoints[index - 1];
      const cpX = (prevPoint.x + point.x) / 2;
      const cpY = (prevPoint.y + point.y) / 2;
      
      // Use quadratic curve for smoother path
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpX, cpY);
      
      // If this is the last point, ensure we complete the line to it
      if (index === pathPoints.length - 1) {
        ctx.lineTo(point.x, point.y);
      }
    }
  });
  
  // Complete the path
  const finalPathX = pathPoints[pathPoints.length - 1].x;
  ctx.lineTo(finalPathX, height - bottomMargin);
  ctx.closePath();
  
  // Create a more vibrant gradient for the filled area
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(255, 87, 34, 0.7)');
  gradient.addColorStop(0.6, 'rgba(255, 87, 34, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 87, 34, 0.1)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw glowing path line with improved anti-aliasing
  ctx.beginPath();
  
  // Start point
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  
  // Draw smooth curves through points for better visual
  for (let i = 1; i < pathPoints.length - 1; i++) {
    const xc = (pathPoints[i].x + pathPoints[i + 1].x) / 2;
    const yc = (pathPoints[i].y + pathPoints[i + 1].y) / 2;
    ctx.quadraticCurveTo(pathPoints[i].x, pathPoints[i].y, xc, yc);
  }
  
  // Handle last point
  if (pathPoints.length > 1) {
    const last = pathPoints.length - 1;
    ctx.quadraticCurveTo(
      pathPoints[last - 1].x, 
      pathPoints[last - 1].y,
      pathPoints[last].x, 
      pathPoints[last].y
    );
  }
  
  // Create a more vibrant glowing path
  const pathGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
  pathGradient.addColorStop(0, '#FFC107'); // Amber
  pathGradient.addColorStop(0.5, '#FF9800'); // Orange
  pathGradient.addColorStop(1, '#FF5722'); // Deep Orange
  
  ctx.strokeStyle = pathGradient;
  ctx.lineWidth = 4 * pixelRatio;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Add shadow for glow effect
  ctx.shadowColor = 'rgba(255, 193, 7, 0.6)';
  ctx.shadowBlur = 10 * pixelRatio;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.stroke();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
};
