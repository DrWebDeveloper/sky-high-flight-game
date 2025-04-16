
import { useRef } from 'react';

export const useAnimationTiming = () => {
  const animationFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);
  const flyAwayStartTime = useRef<number | null>(null);
  const startAnimationTime = useRef<number | null>(null);

  return {
    animationFrameId,
    lastTimestamp,
    flyAwayStartTime,
    startAnimationTime
  };
};
