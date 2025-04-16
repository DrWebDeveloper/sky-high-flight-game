import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import GameCanvas from '@/components/game/GameCanvas';
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

const MULTIPLIER_UPDATE_INTERVAL = 150; // ms - Slower update interval
const MULTIPLIER_BASE = 1.0010; // Slower base increase
const MULTIPLIER_FACTOR = 100; // Keep factor or adjust as needed

// Function to calculate time to reach a specific multiplier
const calculateTimeToMultiplier = (targetMultiplier: number): number => {
  if (targetMultiplier <= 1) return 0;
  // Formula derived from: targetMultiplier = 1 + (pow(MULTIPLIER_BASE, t * MULTIPLIER_FACTOR) - 1)
  // targetMultiplier = pow(MULTIPLIER_BASE, t * MULTIPLIER_FACTOR)
  // log(targetMultiplier) = t * MULTIPLIER_FACTOR * log(MULTIPLIER_BASE)
  // t = log(targetMultiplier) / (MULTIPLIER_FACTOR * log(MULTIPLIER_BASE))
  const timeInSeconds = Math.log(targetMultiplier) / (MULTIPLIER_FACTOR * Math.log(MULTIPLIER_BASE));
  return timeInSeconds * 1000; // Convert to milliseconds
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
  const [isBetPending, setIsBetPending] = useState(false); // Add state for pending bet

  const [bettingHistory, setBettingHistory] = useState(generateInitialBettingHistory(gameHistory));
  const [currentRoundBets, setCurrentRoundBets] = useState<any[]>([]);
  
  const [totalBets, setTotalBets] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [highestMultiplier, setHighestMultiplier] = useState(0);

  // Define handleCashout *before* checkForAutoCashouts and startNewGame/endGame
  const handleCashout = useCallback(() => {
    if (activeBet !== null && isGameActive && !isCashedOut) {
      const cashoutMultiplier = multiplier; // Use current multiplier state
      const profit = parseFloat((activeBet * cashoutMultiplier - activeBet).toFixed(2));
      setUserProfit(profit);
      setUserBalance(prev => prev + activeBet + profit);
      setIsCashedOut(true);
      toast.success(`Cashed out at ${cashoutMultiplier.toFixed(2)}x! Profit: $${profit.toFixed(2)}`);
    }
  }, [activeBet, isGameActive, isCashedOut, multiplier]); // Keep multiplier dependency

  // Define checkForAutoCashouts *after* handleCashout
  const checkForAutoCashouts = useCallback((currentMultiplier: number) => {
    if (activeBet !== null && activeBetAutoCashout !== null && currentMultiplier >= activeBetAutoCashout && !isCashedOut) {
      handleCashout();
    }
    // AI auto-cashout logic could go here if needed during the round
  }, [activeBet, activeBetAutoCashout, isCashedOut, handleCashout]); // handleCashout is now stable

  // Forward declare endGame type for startNewGame's use before definition
  let endGameRef = React.useRef<(finalMultiplier: number) => void>();

  // Define startNewGame *before* endGame
  const startNewGame = useCallback(() => {
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);

    setMultiplier(1.00);
    setIsGameActive(true);
    setIsCashedOut(false);
    setUserProfit(null);
    setIsBetPending(false); // Reset pending state

    // ... (rest of AI bet generation logic) ...
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
    setTotalPlayers(prev => prev + numAIPlayers + (activeBet !== null ? 1 : 0));
    setTotalBets(prev => prev + aiBets.reduce((sum, bet) => sum + bet.betAmount, 0) + (activeBet || 0));

    if (newCrashPoint > highestMultiplier) {
      setHighestMultiplier(newCrashPoint);
    }

    const startTime = Date.now();
    let interval: NodeJS.Timeout | null = null; // Define interval variable

    const gameLoop = () => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const newMultiplier = 1 + (Math.pow(MULTIPLIER_BASE, elapsedSeconds * MULTIPLIER_FACTOR) - 1);
      const currentMultiplier = parseFloat(newMultiplier.toFixed(2));

      setMultiplier(currentMultiplier);
      checkForAutoCashouts(currentMultiplier);

      if (currentMultiplier >= newCrashPoint) {
        if (interval) clearInterval(interval);
        setMultiplier(newCrashPoint); // Ensure final multiplier is the crash point
        if (endGameRef.current) {
          endGameRef.current(newCrashPoint); // Call endGame via ref
        }
      } else {
        // Request next frame if game is still active
        interval = setTimeout(gameLoop, MULTIPLIER_UPDATE_INTERVAL);
      }
    };

    // Start the game loop
    interval = setTimeout(gameLoop, MULTIPLIER_UPDATE_INTERVAL);


    // Cleanup function for the interval
    return () => {
      if (interval) clearInterval(interval);
    };

    // Removed endGame from dependencies, added necessary state/props
  }, [activeBet, highestMultiplier, checkForAutoCashouts, activeBetAutoCashout]);

  // Define endGame *after* startNewGame
  const endGame = useCallback((finalMultiplier: number) => {
    setIsGameActive(false);
    setMultiplier(finalMultiplier); // Use the accurate final multiplier

    const newGame = {
      id: gameHistory.length > 0 ? gameHistory[0].id + 1 : 1,
      multiplier: finalMultiplier,
      timestamp: new Date()
    };

    setGameHistory(prev => [newGame, ...prev].slice(0, 50));

    // ... (rest of betting history update logic) ...
    const updatedBets = currentRoundBets.map(bet => {
      let cashedOutAt = null;
      let profit = null;

      // AI Bet Logic (use finalMultiplier as the crash point)
      if (bet.autoCashout && bet.autoCashout < finalMultiplier) {
        cashedOutAt = bet.autoCashout;
        profit = parseFloat((bet.betAmount * bet.autoCashout - bet.betAmount).toFixed(2));
      }
      // ... (rest of AI logic) ...

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
        autoCashout: activeBetAutoCashout,
        // Use the accurate finalMultiplier for profit calculation if cashed out manually at the end
        cashedOutAt: isCashedOut ? userProfit !== null ? parseFloat(((userProfit / activeBet) + 1).toFixed(2)) : finalMultiplier : null,
        profit: isCashedOut ? userProfit : (activeBet * -1)
      };
      // Adjust player bet if auto-cashout triggered before crash
      if (!isCashedOut && activeBetAutoCashout && activeBetAutoCashout < finalMultiplier) {
        playerBet.cashedOutAt = activeBetAutoCashout;
        playerBet.profit = parseFloat((activeBet * activeBetAutoCashout - activeBet).toFixed(2));
        // Assuming balance was updated by checkForAutoCashouts -> handleCashout
      } else if (!isCashedOut) {
        // If player didn't cash out (manually or auto), they lose the bet
        playerBet.profit = -activeBet;
        playerBet.cashedOutAt = null; // Explicitly null if crashed
      }
      updatedBets.push(playerBet);
    }


    setBettingHistory(prev => [...updatedBets, ...prev].slice(0, 100));

    setActiveBet(null);
    setActiveBetAutoCashout(null);
    // isCashedOut is reset in startNewGame

    let countdown = 5;
    setNextGameCountdown(countdown);

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setNextGameCountdown(countdown);

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        // startNewGame(); // Call startNewGame directly here
        // Need to ensure startNewGame is available. Since it's defined above, it should be.
        // However, calling it directly inside setInterval callback might capture stale state.
        // It's often better to trigger state changes that useEffect can react to.
        // For simplicity now, we call it, but consider refactoring later if issues arise.
        startNewGame(); // Call the memoized startNewGame
      }
    }, 1000);
    // Store countdownInterval ID if needed for cleanup

    // Removed startNewGame from dependencies, added necessary state/props
  }, [gameHistory, activeBet, isCashedOut, userProfit, currentRoundBets, activeBetAutoCashout, startNewGame]); // Keep startNewGame dependency here for the countdown interval

  // Assign the memoized endGame function to the ref after it's defined
  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);


  // ... rest of the component code (handlePlaceBet, handleCancelBet, useEffect, return statement) ...

  const handlePlaceBet = (amount: number, autoCashout: number | null) => {
    if (amount > 0 && amount <= userBalance && !isGameActive && !activeBet) { // Ensure no active bet already exists
      setActiveBet(amount);
      setActiveBetAutoCashout(autoCashout);
      setUserBalance(prev => prev - amount);
      setIsBetPending(true); // Set pending state
      toast.success(`Bet placed for next round: $${amount.toFixed(2)}`);
    } else if (isGameActive) {
      toast.error("Cannot place bet while game is active.");
    } else if (activeBet) {
      toast.error("Bet already placed for the next round.");
    } else if (amount <= 0) {
      toast.error("Bet amount must be positive.");
    } else if (amount > userBalance) {
      toast.error("Insufficient balance.");
    }
  };

  const handleCancelBet = () => {
    if (isBetPending && activeBet !== null) {
      setUserBalance(prev => prev + activeBet); // Refund the bet
      setActiveBet(null);
      setActiveBetAutoCashout(null);
      setIsBetPending(false); // Clear pending state
      toast.info("Bet cancelled.");
    }
  };

  useEffect(() => {
    setTotalBets(bettingHistory.reduce((sum, bet) => sum + bet.betAmount, 0));
    setTotalPlayers(new Set(bettingHistory.map(bet => bet.username)).size);
    // Find the actual highest multiplier from history, not just the last crash point
    const maxHistMultiplier = gameHistory.length > 0 ? Math.max(...gameHistory.map(game => game.multiplier)) : 0;
    setHighestMultiplier(maxHistMultiplier);

    // Start the first game after initial render and state setup
    const timer = setTimeout(() => {
      startNewGame();
    }, 1000); // Delay slightly to ensure everything is initialized

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial effect runs once

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
        
        {/* Corrected grid structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
          <div className="md:col-span-2">
            <GameCanvas 
              isGameActive={isGameActive} 
              multiplier={multiplier} 
              // onGameEnd prop removed in previous step
              crashPoint={crashPoint}
            />
            
            {!isGameActive && (
              // Corrected conditional rendering structure
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
              onCancelBet={handleCancelBet} // Pass cancel handler
              userBalance={userBalance}
              activeBet={activeBet}
              isCashedOut={isCashedOut}
              isBetPending={isBetPending} // Pass pending state
            />
          </div>
        </div> {/* Closing tag for the grid div */}
        
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
