
import React from 'react';

interface MultiplayerFeedProps {
  bets: {
    id: number;
    roundId: number;
    username: string;
    betAmount: number;
    cashedOutAt: number | null;
    profit: number | null;
  }[];
}

const MultiplayerFeed: React.FC<MultiplayerFeedProps> = ({ bets }) => {
  // Sort bets by most recent first
  const sortedBets = [...bets].sort((a, b) => b.id - a.id);

  return (
    <div className="h-64 overflow-y-auto pr-2 space-y-2">
      {sortedBets.map((bet) => (
        <div 
          key={bet.id} 
          className="flex justify-between items-center p-2 rounded-md bg-black/20 border-l-4 border-l-solid transition-all hover:bg-black/30"
          style={{
            borderLeftColor: bet.cashedOutAt 
              ? bet.profit && bet.profit > 0 ? '#2ecc71' : '#e74c3c' 
              : '#3498db'
          }}
        >
          <div className="flex-1">
            <p className="font-medium truncate">{bet.username}</p>
            <p className="text-xs text-gray-400">Bet: ${bet.betAmount.toFixed(2)}</p>
          </div>
          
          <div className="text-right">
            {bet.cashedOutAt ? (
              <>
                <p className={`font-bold ${bet.profit && bet.profit > 0 ? 'text-game-success' : 'text-game-danger'}`}>
                  {bet.cashedOutAt.toFixed(2)}x
                </p>
                <p className={`text-xs ${bet.profit && bet.profit > 0 ? 'text-game-success' : 'text-game-danger'}`}>
                  {bet.profit && bet.profit > 0 ? '+' : ''}{bet.profit?.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-xs italic text-gray-400">In flight</p>
            )}
          </div>
        </div>
      ))}
      
      {sortedBets.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500 italic">
          No recent bets
        </div>
      )}
    </div>
  );
};

export default MultiplayerFeed;
