
import { useState } from 'react';

const generateRandomUser = () => {
  const randomNames = [
    'SkyRider', 'BetMaster', 'LuckyJet', 'HighFlyer', 'CryptoKing',
    'BoldBettor', 'RiskTaker', 'FlightClub', 'SoaringEagle', 'RiskyBusiness',
    'PlaneMaster', 'FlyHigh', 'AcePilot', 'BetHunter', 'TurboPilot'
  ];
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

export const useGameHistory = () => {
  const [gameHistory, setGameHistory] = useState(generateInitialHistory());
  const [bettingHistory, setBettingHistory] = useState(generateInitialBettingHistory(gameHistory));
  const [totalBets, setTotalBets] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [highestMultiplier, setHighestMultiplier] = useState(0);

  return {
    gameHistory,
    setGameHistory,
    bettingHistory,
    setBettingHistory,
    totalBets,
    setTotalBets,
    totalPlayers,
    setTotalPlayers,
    highestMultiplier,
    setHighestMultiplier,
    generateRandomUser
  };
};
