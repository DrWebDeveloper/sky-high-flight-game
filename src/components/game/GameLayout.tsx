
import React from 'react';
import Header from '@/components/Header';
import GameStats from '@/components/GameStats';
import GameCanvas from '@/components/game/GameCanvas';
import BettingPanel from '@/components/BettingPanel';
import GameControls from '@/components/GameControls';

interface GameLayoutProps {
  gameState: {
    isGameActive: boolean;
    multiplier: number;
    crashPoint: number;
    activeBet: number | null;
    userBalance: number;
    isCashedOut: boolean;
    isBetPending: boolean;
  };
  gameHistory: Array<{
    id: number;
    multiplier: number;
    timestamp: Date;
  }>;
  bettingHistory: Array<{
    id: number;
    roundId: number;
    username: string;
    betAmount: number;
    cashedOutAt: number | null;
    profit: number | null;
  }>;
  stats: {
    totalBets: number;
    totalPlayers: number;
    highestMultiplier: number;
  };
  onPlaceBet: (amount: number, autoCashout: number | null) => void;
  onCashout: () => void;
  onCancelBet: () => void;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  gameState,
  gameHistory,
  bettingHistory,
  stats,
  onPlaceBet,
  onCashout,
  onCancelBet
}) => {
  return (
    <div className="min-h-screen bg-game-bg text-white">
      <div className="container p-4 mx-auto max-w-6xl">
        <Header />
        
        <div className="mb-4">
          <GameStats 
            totalBets={stats.totalBets} 
            totalPlayers={stats.totalPlayers} 
            highestMultiplier={stats.highestMultiplier} 
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
              onPlaceBet={onPlaceBet}
              onCashout={onCashout}
              onCancelBet={onCancelBet}
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

export default GameLayout;
