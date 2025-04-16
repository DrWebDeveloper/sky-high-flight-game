
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GameHistory from './GameHistory';
import MultiplayerFeed from './MultiplayerFeed';

interface GameControlsProps {
  gameHistory: {
    id: number;
    multiplier: number;
    timestamp: Date;
  }[];
  bettingHistory: {
    id: number;
    roundId: number;
    username: string;
    betAmount: number;
    cashedOutAt: number | null;
    profit: number | null;
  }[];
}

const GameControls: React.FC<GameControlsProps> = ({
  gameHistory,
  bettingHistory
}) => {
  return (
    <div className="glass-panel p-4">
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="history">Game History</TabsTrigger>
          <TabsTrigger value="players">Live Feed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="mt-0">
          <GameHistory history={gameHistory} />
        </TabsContent>
        
        <TabsContent value="players" className="mt-0">
          <MultiplayerFeed bets={bettingHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameControls;
