import React, { useRef, useEffect, useState, useCallback } from 'react'; // Import useCallback
import aviatorSvg from '/images/aviator.svg';

interface GameCanvasProps {
  isGameActive: boolean;
  multiplier: number;
  // onGameEnd: () => void; // No longer needed directly if Index controls timing
  crashPoint: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ isGameActive, multiplier, crashPoint }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);
  const currentPlanePos = useRef<{ x: number; y: number; angle: number }>({ x: 50, y: 400, angle: 0 }); // Initial position at bottom-left
  const pathPointsRef = useRef<{ x: number; y: number }[]>([{ x: 50, y: 400 }]); // Start path at initial position
  const verticalOffsetRef = useRef(0); // Store vertical offset for smoother random movement
  const [isFlyingAway, setIsFlyingAway] = useState(false); // State for fly away animation
  const flyAwayStartTime = useRef<number | null>(null); // Track start time for fly away

  // Load plane image
  useEffect(() => {
    const img = new Image();
    img.src = aviatorSvg;
    img.onload = () => {
      planeImageRef.current = img;
    };
  }, []);

  // Reset path and position when game becomes active (starts)
  useEffect(() => {
    if (isGameActive) {
      pathPointsRef.current = [{ x: 50, y: 400 }]; // Reset path to start (bottom-left)
      currentPlanePos.current = { x: 50, y: 400, angle: -Math.PI / 6 }; // Reset position and initial angle
      verticalOffsetRef.current = 0; // Reset vertical offset
      lastTimestamp.current = performance.now(); // Reset timestamp for animation delta
      setIsFlyingAway(false); // Reset fly away state
      flyAwayStartTime.current = null; // Reset fly away start time
    } else {
      // Check if crash occurred when becoming inactive
      if (multiplier >= crashPoint && !isFlyingAway) {
        setIsFlyingAway(true);
        flyAwayStartTime.current = performance.now();
      }
    }
  }, [isGameActive, multiplier, crashPoint, isFlyingAway]); // Add isFlyingAway to dependencies


  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const planeImage = planeImageRef.current;
    if (!canvas || !planeImage) {
      animationFrameId.current = requestAnimationFrame(draw);
      return;
    };

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate and clamp deltaTime to prevent large jumps after pauses
    const rawDeltaTime = (timestamp - lastTimestamp.current) / 1000;
    lastTimestamp.current = timestamp;
    const deltaTime = Math.min(rawDeltaTime, 0.1); // Clamp delta time (e.g., max 100ms)

    const width = canvas.width;
    const height = canvas.height;
    const bottomMargin = 50;
    const topMargin = 50;
    const leftMargin = 50;
    const rightMargin = 50;
    const graphHeight = height - bottomMargin - topMargin;
    const graphWidth = width - leftMargin - rightMargin;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background grid (optional)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let x = leftMargin; x <= width - rightMargin; x += 20) { /* ... */ }
    for (let y = topMargin; y <= height - bottomMargin; y += 20) { /* ... */ }


    let nextX = currentPlanePos.current.x;
    let nextY = currentPlanePos.current.y;
    let angle = currentPlanePos.current.angle;

    if (isFlyingAway && flyAwayStartTime.current) {
      // --- Fly Away Animation ---
      const flyAwayDuration = timestamp - flyAwayStartTime.current;
      // Slower fly away speed
      const flyAwaySpeed = 100 + flyAwayDuration / 20; // Reduced base speed and acceleration
      const flyAwayAngle = currentPlanePos.current.angle;

      nextX += Math.cos(flyAwayAngle) * flyAwaySpeed * deltaTime;
      nextY += Math.sin(flyAwayAngle) * flyAwaySpeed * deltaTime - 10 * deltaTime; // Reduced upward drift

      angle = flyAwayAngle;

      // Stop requesting frames if plane is way off screen
      if (nextX > width + 100 || nextX < -100 || nextY < -100 || nextY > height + 100) {
    // Optionally stop animation completely after flying away
    // if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    // animationFrameId.current = null;
    // Don't draw plane or update position if completely off-screen
      }

    } else if (isGameActive) {
      // --- Active Game Movement ---

      // Handle the very start of the game explicitly
      if (multiplier <= 1.01 && pathPointsRef.current.length <= 1) {
        // Keep plane at initial position and angle until multiplier increases slightly
        nextX = leftMargin;
        nextY = height - bottomMargin;
        angle = -Math.PI / 6; // Maintain initial angle
        // Ensure the first point is correct if it wasn't already
        if (pathPointsRef.current.length === 0 || pathPointsRef.current[0].x !== nextX || pathPointsRef.current[0].y !== nextY) {
          pathPointsRef.current = [{ x: nextX, y: nextY }];
        }
        // Update current position directly for the next frame's reference
        currentPlanePos.current = { x: nextX, y: nextY, angle: angle };

      } else {
        // Normal active movement logic (once multiplier > 1.01 or path has > 1 point)
        const rawProgress = (multiplier - 1) / Math.max(0.1, crashPoint > 1 ? crashPoint - 1 : 0.1);
        const progress = Math.pow(rawProgress, 1.5);
        const normalizedProgress = Math.min(1, Math.max(0, progress));

        const curveSteepness = 0.5;
        const targetX = leftMargin + normalizedProgress * graphWidth;
        const baseY = graphHeight - Math.pow(normalizedProgress, curveSteepness) * graphHeight;

        // ... existing random vertical movement ...
        const targetY = topMargin + baseY + verticalOffsetRef.current * graphHeight;

        const lerpFactor = Math.min(1, 2.5 * deltaTime);
        nextX = currentPlanePos.current.x + (targetX - currentPlanePos.current.x) * lerpFactor;
        nextY = currentPlanePos.current.y + (targetY - currentPlanePos.current.y) * lerpFactor;

        // Update Path - Ensure we don't add the initial point again if no movement
        const lastPoint = pathPointsRef.current[pathPointsRef.current.length - 1];
        if (lastPoint && Math.hypot(nextX - lastPoint.x, nextY - lastPoint.y) > 2) { // Add point threshold
          pathPointsRef.current.push({ x: nextX, y: nextY });
        }

        // Calculate Angle only after moving and having enough points
        if (pathPointsRef.current.length >= 2) {
          const p1 = pathPointsRef.current[pathPointsRef.current.length - 2];
          // Use the calculated next position for a more responsive angle target
          const p2 = { x: nextX, y: nextY };
          // Avoid calculating angle if p1 and p2 are the same
          if (Math.hypot(p2.x - p1.x, p2.y - p1.y) > 0.1) {
            const targetAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            let angleDiff = targetAngle - angle;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            angle += angleDiff * lerpFactor;
          }
        }
        // Update current position for next frame
        currentPlanePos.current = { x: nextX, y: nextY, angle: angle };
      }

    } else {
      // --- Game Inactive (Before Fly Away or if not crashed) ---
      // Plane stays at the last position before fly away starts
      const lastPathPoint = pathPointsRef.current[pathPointsRef.current.length - 1];
      if (lastPathPoint) {
        nextX = lastPathPoint.x;
        nextY = lastPathPoint.y;
      }
      // Maintain last angle
      if (pathPointsRef.current.length >= 2) {
        const p1 = pathPointsRef.current[pathPointsRef.current.length - 2];
        const p2 = pathPointsRef.current[pathPointsRef.current.length - 1];
        angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      }
    }


    // --- Draw Filled Red Area (Always based on path) ---
    if (pathPointsRef.current.length > 1) {
      ctx.beginPath();
      ctx.moveTo(leftMargin, height - bottomMargin);
      pathPointsRef.current.forEach(p => {
        ctx.lineTo(p.x, p.y);
      });
      // Use the last point in the path for the area boundary
      const finalPathX = pathPointsRef.current[pathPointsRef.current.length - 1].x;
      const finalPathY = pathPointsRef.current[pathPointsRef.current.length - 1].y;
      ctx.lineTo(finalPathX, finalPathY); // Line to the actual end of the path
      ctx.lineTo(finalPathX, height - bottomMargin); // Line down to bottom
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fill();
    }

    // --- Draw Yellow Path Line (Always based on path) ---
    ctx.beginPath();
    ctx.moveTo(leftMargin, height - bottomMargin);
    pathPointsRef.current.forEach(p => {
      ctx.lineTo(p.x, p.y);
    });
    // Don't extend line to plane if flying away or inactive
    if (isGameActive && !isFlyingAway) {
      ctx.lineTo(nextX, nextY); // Only extend if game is active and not flying away
    }
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();


    // --- Draw Plane ---
    // Only draw if not completely off-screen during fly away
    if (!isFlyingAway || (nextX <= width + 50 && nextX >= -50 && nextY >= -50 && nextY <= height + 50)) {
      const planeWidth = 40;
      const planeHeight = 40 * (planeImage.height / planeImage.width);
      ctx.save();
      ctx.translate(nextX, nextY);
      ctx.rotate(angle);
      ctx.drawImage(planeImage, -planeWidth / 2, -planeHeight / 2, planeWidth, planeHeight);
      ctx.restore();
    }


    // Update current position for next frame
    currentPlanePos.current = { x: nextX, y: nextY, angle: angle };

    // --- Draw Multiplier Text ---
    // Green when active, Red when crashed (after fly away starts or game ends crashed), White otherwise (e.g., before start)
    const crashed = !isGameActive && multiplier >= crashPoint;
    ctx.fillStyle = isGameActive ? '#90EE90' : (crashed ? '#FF6B6B' : '#FFFFFF'); // Light Green if active, Red if crashed, White otherwise
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const displayMultiplier = crashed ? crashPoint : multiplier;
    ctx.fillText(`${displayMultiplier.toFixed(2)}x`, width / 2, height / 2);

    if (crashed && !isFlyingAway) { // Show CRASHED text only before fly away starts
      ctx.fillStyle = '#FF6B6B'; // Red
      ctx.font = 'bold 36px Arial';
      ctx.fillText(`CRASHED @ ${crashPoint.toFixed(2)}x`, width / 2, height / 2 + 50);
    }

    // Request next frame if animation is ongoing
    if (animationFrameId.current !== null) { // Check if animation hasn't been explicitly stopped
      animationFrameId.current = requestAnimationFrame(draw);
    }

  }, [isGameActive, multiplier, crashPoint, isFlyingAway]); // Include isFlyingAway

  // Start/Stop animation loop
  useEffect(() => {
    // Ensure animation starts correctly
    if (!animationFrameId.current) {
      lastTimestamp.current = performance.now(); // Reset timestamp when starting
      animationFrameId.current = requestAnimationFrame(draw);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null; // Set to null when cancelled
      }
    };
  }, [draw]); // Rerun effect if draw function identity changes


  return (
    <div className="relative aspect-video w-full glass-panel overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default GameCanvas;
