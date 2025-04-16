
import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';

interface UseRoundEndProps {
  gameState: {
    activeBet: number | null;
    activeBetAutoCashout: number | null;
    isCashedOut: boolean;
    userProfit: number | null;
  };
  setGameState: React.Dispatch<React.SetStateAction<any>>;
  gameHistory: Array<{
    id: number;
    multiplier: number;
    timestamp: Date;
  }>;
  setGameHistory: (history: any) => void;
  setBettingHistory: (history: any) => void;
  setTotalPlayers: (players: number) => void;
  setTotalBets: (bets: number) => void;
  setHighestMultiplier: (multiplier: number) => void;
  startNewRound: (crashPoint: number) => void;
  generateCrashPoint: () => number;
}

export const useRoundEnd = ({
  gameState,
  setGameState,
  gameHistory,
  setGameHistory,
  setBettingHistory,
  setTotalPlayers,
  setTotalBets,
  setHighestMultiplier,
  startNewRound,
  generateCrashPoint
}: UseRoundEndProps) => {
  const handleRoundEnd = useCallback((finalMultiplier: number) => {
    const newGame = {
      id: gameHistory.length > 0 ? gameHistory[0].id + 1 : 1,
      multiplier: finalMultiplier,
      timestamp: new Date()
    };

    setGameHistory(prev => [newGame, ...prev].slice(0, 50));

    const updatedBets = [];
    if (gameState.activeBet !== null) {
      const playerBet = {
        id: Date.now() + 1000,
        roundId: newGame.id,
        username: "You",
        betAmount: gameState.activeBet,
        autoCashout: gameState.activeBetAutoCashout,
        cashedOutAt: gameState.isCashedOut ? gameState.userProfit !== null ? 
          parseFloat(((gameState.userProfit / gameState.activeBet) + 1).toFixed(2)) : 
          finalMultiplier : null,
        profit: gameState.isCashedOut ? gameState.userProfit : -gameState.activeBet
      };
      updatedBets.push(playerBet);
    }

    setBettingHistory(prev => [...updatedBets, ...prev].slice(0, 100));
    setGameState(prev => ({
      ...prev,
      activeBet: null,
      activeBetAutoCashout: null
    }));

    setTotalPlayers(prev => prev + (gameState.activeBet !== null ? 1 : 0));
    setTotalBets(prev => prev + (gameState.activeBet || 0));

    if (finalMultiplier > gameHistory[0]?.multiplier || 0) {
      setHighestMultiplier(finalMultiplier);
    }

    let countdown = 5;
    setGameState(prev => ({ ...prev, nextGameCountdown: countdown }));

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setGameState(prev => ({ ...prev, nextGameCountdown: countdown }));

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        startNewRound(generateCrashPoint());
      }
    }, 1000);
  }, [gameHistory, gameState, setBettingHistory, setGameHistory, setGameState, 
      setHighestMultiplier, setTotalBets, setTotalPlayers, startNewRound, generateCrashPoint]);

  return { handleRoundEnd };
};
