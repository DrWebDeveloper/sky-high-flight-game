
export const drawBackgroundPlanes = (
  ctx: CanvasRenderingContext2D,
  planeImage: HTMLImageElement,
  planes: { x: number; y: number; angle: number }[],
  timestamp: number,
  width: number,
  height: number
) => {
  planes.forEach((plane, index) => {
    const size = 20 + (index % 3) * 5;
    const opacity = 0.1 + (index % 5) * 0.03;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(plane.x, plane.y);
    ctx.rotate(plane.angle);
    ctx.drawImage(planeImage, -size/2, -size/2, size, size * (planeImage.height / planeImage.width));
    ctx.restore();
    
    planes[index] = {
      x: (plane.x + Math.cos(plane.angle) * 0.5) % width,
      y: (plane.y + Math.sin(plane.angle) * 0.5) % height,
      angle: plane.angle
    };
    
    if (planes[index].x < 0) planes[index].x = width;
    if (planes[index].y < 0) planes[index].y = height;
  });
};
