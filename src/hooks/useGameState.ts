
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';

interface GameState {
  isGameActive: boolean;
  multiplier: number;
  crashPoint: number;
  nextGameCountdown: number;
  userBalance: number;
  activeBet: number | null;
  activeBetAutoCashout: number | null;
  isCashedOut: boolean;
  userProfit: number | null;
  isBetPending: boolean;
}

const generateCrashPoint = () => {
  const houseEdge = 0.05;
  const r = Math.random();
  return r < houseEdge ? 1.0 : Math.max(1.0, Math.floor(100 / (r * 99) * 100) / 100);
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    isGameActive: false,
    multiplier: 1.00,
    crashPoint: 2.00,
    nextGameCountdown: 5,
    userBalance: 1000,
    activeBet: null,
    activeBetAutoCashout: null,
    isCashedOut: false,
    userProfit: null,
    isBetPending: false
  });

  const handleCashout = useCallback(() => {
    if (gameState.activeBet !== null && gameState.isGameActive && !gameState.isCashedOut) {
      const cashoutMultiplier = gameState.multiplier;
      const profit = parseFloat((gameState.activeBet * cashoutMultiplier - gameState.activeBet).toFixed(2));
      setGameState(prev => ({
        ...prev,
        userProfit: profit,
        userBalance: prev.userBalance + gameState.activeBet + profit,
        isCashedOut: true
      }));
      toast.success(`Cashed out at ${cashoutMultiplier.toFixed(2)}x! Profit: $${profit.toFixed(2)}`);
    }
  }, [gameState]);

  const checkForAutoCashouts = useCallback((currentMultiplier: number) => {
    if (
      gameState.activeBet !== null && 
      gameState.activeBetAutoCashout !== null && 
      currentMultiplier >= gameState.activeBetAutoCashout && 
      !gameState.isCashedOut
    ) {
      handleCashout();
    }
  }, [gameState, handleCashout]);

  const handlePlaceBet = useCallback((amount: number, autoCashout: number | null) => {
    if (amount > 0 && amount <= gameState.userBalance && !gameState.isGameActive && !gameState.activeBet) {
      setGameState(prev => ({
        ...prev,
        activeBet: amount,
        activeBetAutoCashout: autoCashout,
        userBalance: prev.userBalance - amount,
        isBetPending: true
      }));
      toast.success(`Bet placed for next round: $${amount.toFixed(2)}`);
    } else if (gameState.isGameActive) {
      toast.error("Cannot place bet while game is active.");
    } else if (gameState.activeBet) {
      toast.error("Bet already placed for the next round.");
    } else if (amount <= 0) {
      toast.error("Bet amount must be positive.");
    } else if (amount > gameState.userBalance) {
      toast.error("Insufficient balance.");
    }
  }, [gameState]);

  const handleCancelBet = useCallback(() => {
    if (gameState.isBetPending && gameState.activeBet !== null) {
      setGameState(prev => ({
        ...prev,
        userBalance: prev.userBalance + gameState.activeBet,
        activeBet: null,
        activeBetAutoCashout: null,
        isBetPending: false
      }));
      toast.info("Bet cancelled.");
    }
  }, [gameState]);

  return {
    gameState,
    setGameState,
    handleCashout,
    checkForAutoCashouts,
    handlePlaceBet,
    handleCancelBet,
    generateCrashPoint
  };
};
