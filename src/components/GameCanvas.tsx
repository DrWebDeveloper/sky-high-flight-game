
import React, { useRef, useEffect, useState, useCallback } from 'react';
import aviatorSvg from '/images/aviator.svg';

interface GameCanvasProps {
  isGameActive: boolean;
  multiplier: number;
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
  const startAnimationTime = useRef<number | null>(null); // Track time for intro animation

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
      // Reset to starting position (off-screen to the left)
      pathPointsRef.current = []; // Clear previous path
      currentPlanePos.current = { x: -50, y: 400, angle: 0 }; // Start off-screen
      verticalOffsetRef.current = 0; // Reset vertical offset
      lastTimestamp.current = performance.now(); // Reset timestamp for animation delta
      setIsFlyingAway(false); // Reset fly away state
      flyAwayStartTime.current = null; // Reset fly away start time
      startAnimationTime.current = performance.now(); // Set start time for intro animation
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
    
    // Draw grid lines (horizontal and vertical)
    for (let x = leftMargin; x <= width - rightMargin; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, topMargin);
      ctx.lineTo(x, height - bottomMargin);
      ctx.stroke();
    }
    
    for (let y = topMargin; y <= height - bottomMargin; y += 50) {
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(width - rightMargin, y);
      ctx.stroke();
    }

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
        // Don't draw plane or update position if completely off-screen
      }
    } else if (isGameActive) {
      // --- Active Game Movement ---
      
      // Handle the intro animation (plane enters from left)
      if (startAnimationTime.current !== null) {
        const introAnimDuration = (timestamp - startAnimationTime.current) / 1000; // in seconds
        const introAnimComplete = introAnimDuration > 1.5; // 1.5 seconds for intro
        
        if (!introAnimComplete) {
          // Smooth entrance from off-screen
          const entranceProgress = Math.min(1, introAnimDuration / 1.5);
          // Easing function for smoother motion
          const easedProgress = 1 - Math.pow(1 - entranceProgress, 3);
          
          nextX = -50 + (leftMargin + 50) * easedProgress;
          nextY = height - bottomMargin - 20;
          angle = -0.1; // Slight upward angle
          
          // Update path if moving significantly
          if (pathPointsRef.current.length === 0 || 
              Math.hypot(nextX - (pathPointsRef.current[pathPointsRef.current.length - 1]?.x || 0), 
                         nextY - (pathPointsRef.current[pathPointsRef.current.length - 1]?.y || 0)) > 5) {
            pathPointsRef.current.push({ x: nextX, y: nextY });
          }
          
          // Update current position
          currentPlanePos.current = { x: nextX, y: nextY, angle };
        } else {
          // Intro finished, clear it
          startAnimationTime.current = null;
          // Ensure path has at least one point
          if (pathPointsRef.current.length === 0) {
            pathPointsRef.current.push({ x: leftMargin, y: height - bottomMargin - 20 });
          }
        }
      } else {
        // Normal active movement logic after intro
        const rawProgress = (multiplier - 1) / Math.max(0.1, crashPoint > 1 ? crashPoint - 1 : 0.1);
        const progress = Math.pow(rawProgress, 1.5);
        const normalizedProgress = Math.min(1, Math.max(0, progress));

        // Generate vertical oscillation based on time to create natural flight path
        if (Math.random() < 0.05) { // Occasionally update vertical offset
          verticalOffsetRef.current = (Math.random() - 0.5) * 0.15; // Smaller random vertical offsets
        }

        const curveSteepness = 0.5;
        const targetX = leftMargin + normalizedProgress * graphWidth;
        const baseY = graphHeight - Math.pow(normalizedProgress, curveSteepness) * graphHeight;
        const targetY = topMargin + baseY + verticalOffsetRef.current * graphHeight;

        const lerpFactor = Math.min(1, 3.0 * deltaTime); // Faster lerping for smoother movement
        nextX = currentPlanePos.current.x + (targetX - currentPlanePos.current.x) * lerpFactor;
        nextY = currentPlanePos.current.y + (targetY - currentPlanePos.current.y) * lerpFactor;

        // Update Path - Ensure we don't add points too frequently (causes jagged lines)
        const lastPoint = pathPointsRef.current[pathPointsRef.current.length - 1];
        if (lastPoint && Math.hypot(nextX - lastPoint.x, nextY - lastPoint.y) > 3) { // Add point threshold
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
            
            // Smoother angle lerping
            angle += angleDiff * Math.min(1, 4.0 * deltaTime);
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
      const firstPoint = pathPointsRef.current[0];
      ctx.moveTo(firstPoint.x, height - bottomMargin); // Start at bottom of first x point
      
      pathPointsRef.current.forEach(p => {
        ctx.lineTo(p.x, p.y);
      });
      
      // Use the last point in the path for the area boundary
      const finalPathX = pathPointsRef.current[pathPointsRef.current.length - 1].x;
      const finalPathY = pathPointsRef.current[pathPointsRef.current.length - 1].y;
      ctx.lineTo(finalPathX, finalPathY); // Line to the actual end of the path
      ctx.lineTo(finalPathX, height - bottomMargin); // Line down to bottom
      ctx.closePath();
      
      // Gradient fill for more attractive look
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // --- Draw Yellow Path Line (Always based on path) ---
    if (pathPointsRef.current.length > 0) {
      ctx.beginPath();
      const firstPoint = pathPointsRef.current[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);
      
      pathPointsRef.current.forEach((p, index) => {
        if (index > 0) ctx.lineTo(p.x, p.y);
      });
      
      // Don't extend line to plane if flying away or inactive
      if (isGameActive && !isFlyingAway && startAnimationTime.current === null) {
        ctx.lineTo(nextX, nextY); // Only extend if game is active and not flying away/in intro
      }
      
      // Gradient stroke for better visibility
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#FFC700');  // Brighter yellow
      gradient.addColorStop(1, '#FFD700');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // --- Draw Plane ---
    // Only draw if not completely off-screen during fly away
    if (!isFlyingAway || (nextX <= width + 50 && nextX >= -50 && nextY >= -50 && nextY <= height + 50)) {
      const planeWidth = 50; // Slightly larger plane
      const planeHeight = 50 * (planeImage.height / planeImage.width);
      
      // Add glow effect to plane when active
      if (isGameActive && startAnimationTime.current === null) {
        ctx.save();
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      ctx.save();
      ctx.translate(nextX, nextY);
      ctx.rotate(angle);
      ctx.drawImage(planeImage, -planeWidth / 2, -planeHeight / 2, planeWidth, planeHeight);
      ctx.restore();
      
      if (isGameActive && startAnimationTime.current === null) {
        ctx.restore(); // Restore after glow effect
      }
    }

    // --- Draw Multiplier Text ---
    // Green when active, Red when crashed (after fly away starts or game ends crashed), White otherwise
    const crashed = !isGameActive && multiplier >= crashPoint;
    ctx.fillStyle = isGameActive ? '#90EE90' : (crashed ? '#FF6B6B' : '#FFFFFF');
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Bigger initial display when game starts
    if (isGameActive && startAnimationTime.current !== null) {
      const introProgress = Math.min(1, (timestamp - startAnimationTime.current) / 1000);
      const scaleFactor = 1 + (1 - introProgress) * 0.5; // Scale from 1.5 to 1.0
      
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(scaleFactor, scaleFactor);
      ctx.fillText(`${multiplier.toFixed(2)}x`, 0, 0);
      ctx.restore();
    } else {
      // Normal multiplier display
      const displayMultiplier = crashed ? crashPoint : multiplier;
      ctx.fillText(`${displayMultiplier.toFixed(2)}x`, width / 2, height / 2);
    }

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
