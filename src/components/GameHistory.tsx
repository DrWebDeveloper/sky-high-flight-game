
import React from 'react';

interface GameHistoryProps {
  history: {
    id: number;
    multiplier: number;
    timestamp: Date;
  }[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ history }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {history.slice(0, 12).map((round) => (
          <div 
            key={round.id} 
            className={`
              h-12 w-12 rounded-md flex items-center justify-center font-bold text-sm
              ${round.multiplier < 1.5 ? 'bg-game-danger/20 text-game-danger' : 
                round.multiplier < 2.0 ? 'bg-game-warning/20 text-game-warning' : 
                'bg-game-success/20 text-game-success'}
            `}
            title={`${round.multiplier.toFixed(2)}x at ${round.timestamp.toLocaleTimeString()}`}
          >
            {round.multiplier.toFixed(2)}x
          </div>
        ))}
      </div>
      
      <div className="stats-summary grid grid-cols-3 gap-2 text-center">
        <div className="bg-black/20 p-2 rounded-md">
          <p className="text-xs text-gray-400">Last</p>
          <p className="font-bold text-lg">
            {history.length > 0 ? history[0].multiplier.toFixed(2) + 'x' : '-'}
          </p>
        </div>
        <div className="bg-black/20 p-2 rounded-md">
          <p className="text-xs text-gray-400">High</p>
          <p className="font-bold text-lg text-game-success">
            {history.length > 0 
              ? Math.max(...history.map(h => h.multiplier)).toFixed(2) + 'x' 
              : '-'}
          </p>
        </div>
        <div className="bg-black/20 p-2 rounded-md">
          <p className="text-xs text-gray-400">Low</p>
          <p className="font-bold text-lg text-game-danger">
            {history.length > 0 
              ? Math.min(...history.map(h => h.multiplier)).toFixed(2) + 'x' 
              : '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
