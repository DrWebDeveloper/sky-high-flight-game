
import { useCallback, useRef } from 'react';
import { MULTIPLIER_UPDATE_INTERVAL, MULTIPLIER_GROWTH_SPEED } from '@/constants/gameConstants';
import { checkForAutoCashouts } from '@/utils/gameUtils';
import { GameState } from '@/hooks/useGameState';

interface UseGameRoundProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  handleCashout: () => void;
}

export const useGameRound = ({
  gameState,
  setGameState,
  handleCashout
}: UseGameRoundProps) => {
  const multiplierIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startNewRound = useCallback((newCrashPoint: number) => {
    console.log("Starting new game with crash point:", newCrashPoint);
    
    setGameState(prev => ({
      ...prev,
      crashPoint: newCrashPoint,
      multiplier: 1.00,
      isGameActive: true,
      isCashedOut: false,
      userProfit: null,
      isBetPending: false
    }));
  }, [setGameState]);

  const endRound = useCallback((finalMultiplier: number, onRoundEnd: (finalMultiplier: number) => void) => {
    console.log("Game ended at multiplier:", finalMultiplier);
    
    setGameState(prev => ({
      ...prev,
      isGameActive: false,
      multiplier: finalMultiplier
    }));

    onRoundEnd(finalMultiplier);
  }, [setGameState]);

  const startMultiplierInterval = useCallback((onRoundEnd: (finalMultiplier: number) => void) => {
    if (multiplierIntervalRef.current) {
      clearInterval(multiplierIntervalRef.current);
    }

    const startTime = Date.now();
    
    multiplierIntervalRef.current = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const newMultiplier = 1 + Math.pow(elapsedSeconds, 1.5) * MULTIPLIER_GROWTH_SPEED;
      const roundedMultiplier = parseFloat(newMultiplier.toFixed(2));
      
      setGameState(prev => {
        if (roundedMultiplier >= prev.crashPoint) {
          if (multiplierIntervalRef.current) {
            clearInterval(multiplierIntervalRef.current);
            multiplierIntervalRef.current = null;
          }
          
          setTimeout(() => endRound(prev.crashPoint, onRoundEnd), 0);
          return prev;
        }
        
        return {
          ...prev,
          multiplier: roundedMultiplier
        };
      });
      
      checkForAutoCashouts(roundedMultiplier, gameState, handleCashout);
      
    }, MULTIPLIER_UPDATE_INTERVAL);
    
    return () => {
      if (multiplierIntervalRef.current) {
        clearInterval(multiplierIntervalRef.current);
        multiplierIntervalRef.current = null;
      }
    };
  }, [gameState, handleCashout, setGameState, endRound]);

  return {
    startNewRound,
    endRound,
    startMultiplierInterval
  };
};
