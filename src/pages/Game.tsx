
import React, { useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useGameHistory } from '@/hooks/useGameHistory';
import { useGameRound } from '@/hooks/useGameRound';
import { useRoundEnd } from '@/hooks/useRoundEnd';
import GameLayout from '@/components/game/GameLayout';

const Game = () => {
  const {
    gameState,
    setGameState,
    handleCashout,
    handlePlaceBet,
    handleCancelBet,
    generateCrashPoint
  } = useGameState();

  const {
    gameHistory,
    setGameHistory,
    bettingHistory,
    setBettingHistory,
    totalBets,
    setTotalBets,
    totalPlayers,
    setTotalPlayers,
    highestMultiplier,
    setHighestMultiplier
  } = useGameHistory();

  const { startNewRound, startMultiplierInterval } = useGameRound({
    gameState,
    setGameState,
    handleCashout
  });

  const { handleRoundEnd } = useRoundEnd({
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
  });

  useEffect(() => {
    if (gameState.isGameActive) {
      return startMultiplierInterval(handleRoundEnd);
    }
  }, [gameState.isGameActive, handleRoundEnd, startMultiplierInterval]);

  useEffect(() => {
    setTotalBets(bettingHistory.reduce((sum, bet) => sum + bet.betAmount, 0));
    setTotalPlayers(new Set(bettingHistory.map(bet => bet.username)).size);
    const maxHistMultiplier = gameHistory.length > 0 ? Math.max(...gameHistory.map(game => game.multiplier)) : 0;
    setHighestMultiplier(maxHistMultiplier);

    const timer = setTimeout(() => {
      startNewRound(generateCrashPoint());
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GameLayout
      gameState={gameState}
      gameHistory={gameHistory}
      bettingHistory={bettingHistory}
      stats={{
        totalBets,
        totalPlayers,
        highestMultiplier
      }}
      onPlaceBet={handlePlaceBet}
      onCashout={handleCashout}
      onCancelBet={handleCancelBet}
    />
  );
};

export default Game;
