
import { useRef, MutableRefObject } from 'react';

interface PlanePosition {
  x: number;
  y: number;
  angle: number;
}

export const usePlanePosition = (initialX = -50, initialY = 400, initialAngle = 0) => {
  const currentPlanePos = useRef<PlanePosition>({ x: initialX, y: initialY, angle: initialAngle });
  const pathPointsRef = useRef<{ x: number; y: number }[]>([]);
  const verticalOffsetRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  
  // Add smoothing factor for path generation
  const pathSmoothingRef = useRef<number>(0.3);
  
  const updatePlanePosition = (
    targetX: number, 
    targetY: number, 
    deltaTime: number,
    lerpFactor: number = 3.0
  ): void => {
    const { x: currentX, y: currentY } = currentPlanePos.current;
    
    // Calculate smooth transition to target position
    const adjustedLerpFactor = Math.min(1, lerpFactor * deltaTime);
    const nextX = currentX + (targetX - currentX) * adjustedLerpFactor;
    const nextY = currentY + (targetY - currentY) * adjustedLerpFactor;
    
    // Update position
    currentPlanePos.current.x = nextX;
    currentPlanePos.current.y = nextY;
  };
  
  const updatePlaneAngle = (
    targetAngle: number,
    deltaTime: number,
    rotationSpeed: number = 4.0
  ): void => {
    const { angle: currentAngle } = currentPlanePos.current;
    
    // Normalize angle difference
    let angleDiff = targetAngle - currentAngle;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    
    // Apply smooth rotation
    const adjustedRotationSpeed = Math.min(1, rotationSpeed * deltaTime);
    const nextAngle = currentAngle + angleDiff * adjustedRotationSpeed;
    
    // Update angle
    currentPlanePos.current.angle = nextAngle;
  };
  
  const addPathPoint = (x: number, y: number, minDistance: number = 5): void => {
    const lastPoint = pathPointsRef.current[pathPointsRef.current.length - 1];
    
    // Add point only if it's far enough from the last point
    if (!lastPoint || Math.hypot(x - lastPoint.x, y - lastPoint.y) > minDistance) {
      pathPointsRef.current.push({ x, y });
      
      // Limit path points to prevent memory issues
      if (pathPointsRef.current.length > 200) {
        pathPointsRef.current = pathPointsRef.current.slice(-200);
      }
    }
  };
  
  return {
    currentPlanePos,
    pathPointsRef,
    verticalOffsetRef,
    targetAngleRef,
    pathSmoothingRef,
    updatePlanePosition,
    updatePlaneAngle,
    addPathPoint
  };
};
