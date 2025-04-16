import React, { useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import GameCanvas from '@/components/game/GameCanvas';
import BettingPanel from '@/components/BettingPanel';
import GameControls from '@/components/GameControls';
import GameStats from '@/components/GameStats';
import { useGameState } from '@/hooks/useGameState';
import { useGameHistory } from '@/hooks/useGameHistory';
import { MULTIPLIER_BASE, MULTIPLIER_UPDATE_INTERVAL } from '@/constants/gameConstants';
import { checkForAutoCashouts } from '@/utils/gameUtils';

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

  const multiplierIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle multiplier updates when game is active
  useEffect(() => {
    if (gameState.isGameActive) {
      // Clear any existing interval
      if (multiplierIntervalRef.current) {
        clearInterval(multiplierIntervalRef.current);
      }

      const startTime = Date.now();
      
      // Set up interval to update multiplier
      multiplierIntervalRef.current = setInterval(() => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const newMultiplier = parseFloat((Math.pow(MULTIPLIER_BASE, elapsedSeconds * 100)).toFixed(2));
        
        setGameState(prev => {
          // Check if we've reached or exceeded the crash point
          if (newMultiplier >= prev.crashPoint) {
            // Clear the interval and end the game
            if (multiplierIntervalRef.current) {
              clearInterval(multiplierIntervalRef.current);
              multiplierIntervalRef.current = null;
            }
            
            // Schedule ending the game in the next tick to avoid state update conflicts
            setTimeout(() => endGame(prev.crashPoint), 0);
            return prev;
          }
          
          // Otherwise update the multiplier
          return {
            ...prev,
            multiplier: newMultiplier
          };
        });
        
        // Check for auto-cashouts with the updated multiplier
        checkForAutoCashouts(newMultiplier, gameState, handleCashout);
        
      }, MULTIPLIER_UPDATE_INTERVAL);
      
      return () => {
        if (multiplierIntervalRef.current) {
          clearInterval(multiplierIntervalRef.current);
          multiplierIntervalRef.current = null;
        }
      };
    }
  }, [gameState.isGameActive, gameState.crashPoint, handleCashout]);

  const startNewGame = useCallback(() => {
    const newCrashPoint = generateCrashPoint();
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

    // Update game stats...
    setTotalPlayers(prev => prev + (gameState.activeBet !== null ? 1 : 0));
    setTotalBets(prev => prev + (gameState.activeBet || 0));

    if (newCrashPoint > highestMultiplier) {
      setHighestMultiplier(newCrashPoint);
    }
  }, [gameState.activeBet, generateCrashPoint, highestMultiplier, setGameState, setHighestMultiplier, setTotalBets, setTotalPlayers]);

  const endGame = useCallback((finalMultiplier: number) => {
    console.log("Game ended at multiplier:", finalMultiplier);
    
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
