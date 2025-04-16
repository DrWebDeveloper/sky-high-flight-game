import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import GameCanvas from '@/components/GameCanvas';
import BettingPanel from '@/components/BettingPanel';
import GameControls from '@/components/GameControls';
import GameStats from '@/components/GameStats';
import { toast } from '@/components/ui/sonner';

const generateCrashPoint = () => {
  const houseEdge = 0.05;
  const r = Math.random();
  
  if (r < houseEdge) {
    return 1.0;
  }
  
  return Math.max(1.0, Math.floor(100 / (r * 99) * 100) / 100);
};

const randomNames = [
  'SkyRider', 'BetMaster', 'LuckyJet', 'HighFlyer', 'CryptoKing',
  'BoldBettor', 'RiskTaker', 'FlightClub', 'SoaringEagle', 'RiskyBusiness',
  'PlaneMaster', 'FlyHigh', 'AcePilot', 'BetHunter', 'TurboPilot'
];

const generateRandomUser = () => {
  const nameIndex = Math.floor(Math.random() * randomNames.length);
  return randomNames[nameIndex] + Math.floor(Math.random() * 1000);
};

const generateInitialHistory = () => {
  return Array.from({ length: 15 }, (_, i) => ({
    id: 15 - i,
    multiplier: parseFloat((1 + Math.random() * 5).toFixed(2)),
    timestamp: new Date(Date.now() - i * 60000)
  }));
};

const generateInitialBettingHistory = (gameHistory: any[]) => {
  return gameHistory.flatMap((game) => {
    const numBets = Math.floor(Math.random() * 4);
    return Array.from({ length: numBets }, (_, i) => {
      const betAmount = Math.floor(Math.random() * 100) + 10;
      const didCashOut = Math.random() > 0.2;
      const cashoutMultiplier = didCashOut 
        ? Math.min(game.multiplier, parseFloat((1 + Math.random() * (game.multiplier - 1)).toFixed(2)))
        : null;
      
      return {
        id: game.id * 10 + i,
        roundId: game.id,
        username: generateRandomUser(),
        betAmount: betAmount,
        cashedOutAt: cashoutMultiplier,
        profit: cashoutMultiplier ? parseFloat((betAmount * cashoutMultiplier - betAmount).toFixed(2)) : null
      };
    });
  });
};

const Index: React.FC = () => {
  const [isGameActive, setIsGameActive] = useState(false);
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(2.00);
  const [nextGameCountdown, setNextGameCountdown] = useState(5);
  const [gameHistory, setGameHistory] = useState(generateInitialHistory());
  
  const [userBalance, setUserBalance] = useState(1000);
  const [activeBet, setActiveBet] = useState<null | number>(null);
  const [activeBetAutoCashout, setActiveBetAutoCashout] = useState<null | number>(null);
  const [isCashedOut, setIsCashedOut] = useState(false);
  const [userProfit, setUserProfit] = useState<null | number>(null);
  
  const [bettingHistory, setBettingHistory] = useState(generateInitialBettingHistory(gameHistory));
  const [currentRoundBets, setCurrentRoundBets] = useState<any[]>([]);
  
  const [totalBets, setTotalBets] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [highestMultiplier, setHighestMultiplier] = useState(0);
  
  const startNewGame = useCallback(() => {
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    
    setMultiplier(1.00);
    setIsGameActive(true);
    setIsCashedOut(false);
    setUserProfit(null);
    
    const numAIPlayers = Math.floor(Math.random() * 5) + 1;
    const aiBets = Array.from({ length: numAIPlayers }, (_, i) => {
      const betAmount = Math.floor(Math.random() * 100) + 10;
      const autoCashout = Math.random() > 0.7 ? null : parseFloat((1 + Math.random() * 4).toFixed(2));
      
      return {
        id: Date.now() + i,
        username: generateRandomUser(),
        betAmount: betAmount,
        autoCashout: autoCashout
      };
    });
    
    setCurrentRoundBets(aiBets);
    setTotalPlayers(prev => prev + numAIPlayers + (activeBet ? 1 : 0));
    setTotalBets(prev => prev + aiBets.reduce((sum, bet) => sum + bet.betAmount, 0) + (activeBet || 0));
    
    if (newCrashPoint > highestMultiplier) {
      setHighestMultiplier(newCrashPoint);
    }
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newMultiplier = 1 + (Math.pow(1.0015, elapsed * 100) - 1);
      
      setMultiplier(parseFloat(newMultiplier.toFixed(2)));
      
      checkForAutoCashouts(newMultiplier);
    }, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      endGame();
    }, newCrashPoint * 1000);
  }, [activeBet, highestMultiplier]);
  
  const endGame = useCallback(() => {
    setIsGameActive(false);
    
    const newGame = {
      id: gameHistory.length > 0 ? gameHistory[0].id + 1 : 1,
      multiplier: crashPoint,
      timestamp: new Date()
    };
    
    setGameHistory(prev => [newGame, ...prev].slice(0, 50));
    
    const updatedBets = currentRoundBets.map(bet => {
      let cashedOutAt = null;
      let profit = null;
      
      if (bet.autoCashout && bet.autoCashout < crashPoint) {
        cashedOutAt = bet.autoCashout;
        profit = parseFloat((bet.betAmount * bet.autoCashout - bet.betAmount).toFixed(2));
      } 
      else if (!bet.autoCashout && Math.random() > 0.3 && crashPoint > 1.2) {
        cashedOutAt = parseFloat((1 + Math.random() * (crashPoint - 1.1)).toFixed(2));
        profit = parseFloat((bet.betAmount * cashedOutAt - bet.betAmount).toFixed(2));
      }
      
      return {
        ...bet,
        roundId: newGame.id,
        cashedOutAt,
        profit
      };
    });
    
    if (activeBet !== null) {
      const playerBet = {
        id: Date.now() + 1000,
        roundId: newGame.id,
        username: "You",
        betAmount: activeBet,
        cashedOutAt: isCashedOut ? userProfit ? userProfit / activeBet + 1 : null : null,
        profit: userProfit
      };
      updatedBets.push(playerBet);
    }
    
    setBettingHistory(prev => [...updatedBets, ...prev].slice(0, 100));
    
    setActiveBet(null);
    setActiveBetAutoCashout(null);
    
    let countdown = 5;
    setNextGameCountdown(countdown);
    
    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setNextGameCountdown(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        startNewGame();
      }
    }, 1000);
  }, [gameHistory, crashPoint, activeBet, isCashedOut, userProfit, currentRoundBets, startNewGame]);
  
  const checkForAutoCashouts = (currentMultiplier: number) => {
    if (activeBet !== null && activeBetAutoCashout !== null && currentMultiplier >= activeBetAutoCashout && !isCashedOut) {
      handleCashout();
    }
  };
  
  const handlePlaceBet = (amount: number, autoCashout: number | null) => {
    if (amount > 0 && amount <= userBalance && !isGameActive) {
      setActiveBet(amount);
      setActiveBetAutoCashout(autoCashout);
      setUserBalance(prev => prev - amount);
      toast.success(`Bet placed: $${amount.toFixed(2)}`);
    }
  };
  
  const handleCashout = () => {
    if (activeBet !== null && isGameActive && !isCashedOut) {
      const profit = parseFloat((activeBet * multiplier - activeBet).toFixed(2));
      setUserProfit(profit);
      setUserBalance(prev => prev + activeBet + profit);
      setIsCashedOut(true);
      toast.success(`Cashed out at ${multiplier.toFixed(2)}x! Profit: $${profit.toFixed(2)}`);
    }
  };
  
  useEffect(() => {
    setTotalBets(bettingHistory.reduce((sum, bet) => sum + bet.betAmount, 0));
    setTotalPlayers(new Set(bettingHistory.map(bet => bet.username)).size);
    setHighestMultiplier(Math.max(...gameHistory.map(game => game.multiplier)));
    
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
              isGameActive={isGameActive} 
              multiplier={multiplier} 
              onGameEnd={endGame}
              crashPoint={crashPoint}
            />
            
            {!isGameActive && (
              <div className="flex justify-center mt-2">
                <div className="glass-panel px-4 py-1 rounded-full">
                  <p className="text-sm">Next round in: <span className="font-bold">{nextGameCountdown}s</span></p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <BettingPanel 
              isGameActive={isGameActive}
              onPlaceBet={handlePlaceBet}
              onCashout={handleCashout}
              userBalance={userBalance}
              activeBet={activeBet}
              isCashedOut={isCashedOut}
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

export default Index;
