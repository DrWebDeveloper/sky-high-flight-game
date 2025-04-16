
import { useState, useEffect } from 'react';

interface UseGameCountdownProps {
  isGameActive: boolean;
  onCountdownComplete: () => void;
}

export const useGameCountdown = ({ isGameActive, onCountdownComplete }: UseGameCountdownProps) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isGameActive) {
      let timer: NodeJS.Timeout;
      let remaining = 5;
      
      setCountdown(remaining);
      
      const countdownInterval = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          onCountdownComplete();
        }
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [isGameActive, onCountdownComplete]);

  return countdown;
};
