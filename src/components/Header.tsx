
import React from 'react';
import { PlaneTakeoff } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 glass-panel mb-4">
      <div className="flex items-center space-x-2">
        <PlaneTakeoff className="text-game-primary h-6 w-6" />
        <h1 className="text-xl font-bold">Sky High</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-sm px-3 py-1 rounded bg-game-primary/20 hover:bg-game-primary/30 transition-colors">
          How to Play
        </button>
      </div>
    </header>
  );
};

export default Header;
