
import React from 'react';

interface GameStatsProps {
  totalBets: number;
  totalPlayers: number;
  highestMultiplier: number;
}

const GameStats: React.FC<GameStatsProps> = ({
  totalBets,
  totalPlayers,
  highestMultiplier
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="glass-panel py-2 px-1">
        <p className="text-xs text-gray-300">Players</p>
        <p className="font-bold text-lg">{totalPlayers}</p>
      </div>
      <div className="glass-panel py-2 px-1">
        <p className="text-xs text-gray-300">Bets</p>
        <p className="font-bold text-lg">${totalBets.toLocaleString()}</p>
      </div>
      <div className="glass-panel py-2 px-1">
        <p className="text-xs text-gray-300">Top Win</p>
        <p className="font-bold text-lg text-game-success">{highestMultiplier.toFixed(2)}x</p>
      </div>
    </div>
  );
};

export default GameStats;
