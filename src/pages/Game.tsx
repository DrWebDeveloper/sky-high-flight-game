
import React, { useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import GameCanvas from '@/components/game/GameCanvas';
import BettingPanel from '@/components/BettingPanel';
import GameControls from '@/components/GameControls';
import GameStats from '@/components/GameStats';
import { useGameState } from '@/hooks/useGameState';
import { useGameHistory } from '@/hooks/useGameHistory';

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

  const startNewGame = useCallback(() => {
    const newCrashPoint = generateCrashPoint();
    setGameState(prev => ({
      ...prev,
      crashPoint: newCrashPoint,
      multiplier: 1.00,
      isGameActive: true,
      isCashedOut: false,
      userProfit: null,
      isBetPending: false
    }));

    // Update game stats...
    setTotalPlayers(prev => prev + (gameState.activeBet !== null ? 1 : 0));
    setTotalBets(prev => prev + (gameState.activeBet || 0));

    if (newCrashPoint > highestMultiplier) {
      setHighestMultiplier(newCrashPoint);
    }
  }, [gameState.activeBet, generateCrashPoint, highestMultiplier, setGameState, setHighestMultiplier, setTotalBets, setTotalPlayers]);

  const endGame = useCallback((finalMultiplier: number) => {
    setGameState(prev => ({
      ...prev,
      isGameActive: false,
      multiplier: finalMultiplier
    }));

    const newGame = {
      id: gameHistory.length > 0 ? gameHistory[0].id + 1 : 1,
      multiplier: finalMultiplier,
      timestamp: new Date()
    };

    setGameHistory(prev => [newGame, ...prev].slice(0, 50));

    // Update betting history...
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

    // Start countdown for next game
    let countdown = 5;
    setGameState(prev => ({ ...prev, nextGameCountdown: countdown }));

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setGameState(prev => ({ ...prev, nextGameCountdown: countdown }));

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        startNewGame();
      }
    }, 1000);
  }, [gameHistory, gameState, setBettingHistory, setGameHistory, setGameState, startNewGame]);

  // Initialize game state
  useEffect(() => {
    setTotalBets(bettingHistory.reduce((sum, bet) => sum + bet.betAmount, 0));
    setTotalPlayers(new Set(bettingHistory.map(bet => bet.username)).size);
    const maxHistMultiplier = gameHistory.length > 0 ? Math.max(...gameHistory.map(game => game.multiplier)) : 0;
    setHighestMultiplier(maxHistMultiplier);

    const timer = setTimeout(() => {
      startNewGame();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-game-bg text-white">
      <div className="container p-4 mx-auto max-w-6xl">
        <Header />
        
        <div className="mb-4">
          <GameStats 
            totalBets={totalBets} 
            totalPlayers={totalPlayers} 
            highestMultiplier={highestMultiplier} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
          <div className="md:col-span-2">
            <GameCanvas 
              isGameActive={gameState.isGameActive} 
              multiplier={gameState.multiplier} 
              crashPoint={gameState.crashPoint}
            />
          </div>
          
          <div>
            <BettingPanel 
              isGameActive={gameState.isGameActive}
              onPlaceBet={handlePlaceBet}
              onCashout={handleCashout}
              onCancelBet={handleCancelBet}
              userBalance={gameState.userBalance}
              activeBet={gameState.activeBet}
              isCashedOut={gameState.isCashedOut}
              isBetPending={gameState.isBetPending}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <GameControls 
            gameHistory={gameHistory} 
            bettingHistory={bettingHistory} 
          />
        </div>
      </div>
    </div>
  );
};

export default Game;
