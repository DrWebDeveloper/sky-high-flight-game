
import { useRef } from 'react';

interface PlanePosition {
  x: number;
  y: number;
  angle: number;
}

export const usePlanePosition = (initialX = 50, initialY = 400, initialAngle = 0) => {
  const currentPlanePos = useRef<PlanePosition>({ x: initialX, y: initialY, angle: initialAngle });
  const pathPointsRef = useRef<{ x: number; y: number }[]>([{ x: initialX, y: initialY }]);
  const verticalOffsetRef = useRef(0);

  return {
    currentPlanePos,
    pathPointsRef,
    verticalOffsetRef
  };
};
