
import React, { useCallback, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useGameHistory } from '@/hooks/useGameHistory';
import { useGameRound } from '@/hooks/useGameRound';
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

    if (finalMultiplier > highestMultiplier) {
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
      setHighestMultiplier, setTotalBets, setTotalPlayers, highestMultiplier, 
      startNewRound, generateCrashPoint]);

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
