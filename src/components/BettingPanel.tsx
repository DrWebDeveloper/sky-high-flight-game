import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Plus, Minus, Undo, X } from 'lucide-react'; // Import X icon for Cancel

interface BettingPanelProps {
  isGameActive: boolean;
  onPlaceBet: (amount: number, autoCashout: number | null) => void;
  onCashout: () => void;
  onCancelBet: () => void; // Add cancel bet handler prop
  userBalance: number;
  activeBet: number | null;
  isCashedOut: boolean;
  isBetPending: boolean; // Add pending state prop
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  isGameActive,
  onPlaceBet,
  onCashout,
  onCancelBet, // Destructure new prop
  userBalance,
  activeBet,
  isCashedOut,
  isBetPending // Destructure new prop
}) => {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(false);
  const [autoCashoutValue, setAutoCashoutValue] = useState<string>("2.00");

  const handlePlaceBet = () => {
    if (betAmount > 0 && betAmount <= userBalance) {
      onPlaceBet(betAmount, autoCashoutEnabled ? parseFloat(autoCashoutValue) : null);
    }
  };

  const handleAutoCashoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAutoCashoutValue(value);
    }
  };

  const incrementBet = () => {
    setBetAmount(prev => Math.min(prev + 10, userBalance));
  };

  const decrementBet = () => {
    setBetAmount(prev => Math.max(prev - 10, 0));
  };

  const resetBet = () => {
    setBetAmount(10);
  };

  const isInputDisabled = isGameActive || isBetPending; // Disable inputs when bet is pending

  return (
    <div className="glass-panel p-4 md:p-6 space-y-4">
      <h2 className="text-lg font-semibold">Place Your Bet</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-300">Bet Amount</label>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={decrementBet}
              disabled={isInputDisabled || betAmount <= 0} // Use isInputDisabled
              className="h-8 w-8"
            >
              <Minus size={16} />
            </Button>
            
            <div className="relative flex-1">
              <DollarSign size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.min(parseFloat(e.target.value) || 0, userBalance))}
                disabled={isInputDisabled} // Use isInputDisabled
                className="pl-8"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={incrementBet}
              disabled={isInputDisabled || betAmount >= userBalance} // Use isInputDisabled
              className="h-8 w-8"
            >
              <Plus size={16} />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={resetBet}
              disabled={isInputDisabled} // Use isInputDisabled
              className="h-8 w-8"
            >
              <Undo size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCashoutEnabled}
              onChange={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
              disabled={isInputDisabled} // Use isInputDisabled
              className="h-4 w-4 rounded border-gray-300 text-game-primary focus:ring-game-primary"
            />
            <span className="text-sm">Auto Cashout</span>
          </label>
          
          <div className="flex-1">
            <Input
              type="text"
              value={autoCashoutValue}
              onChange={handleAutoCashoutChange}
              disabled={isInputDisabled || !autoCashoutEnabled} // Use isInputDisabled
              className="text-right"
              placeholder="2.00"
            />
          </div>
        </div>
        
        {isGameActive && activeBet ? (
          <Button
            onClick={onCashout}
            disabled={isCashedOut}
            className={`w-full h-12 text-lg font-bold ${
              isCashedOut ? 'bg-game-success/50' : 'bg-game-danger hover:bg-game-danger/80'
            }`}
          >
            {isCashedOut ? 'CASHED OUT' : 'CASH OUT NOW'}
          </Button>
        ) : isBetPending ? ( // Condition for Cancel button
          <Button
            onClick={onCancelBet}
            variant="destructive" // Use destructive variant for cancel
            className="w-full h-12 text-lg font-bold"
          >
            <X className="mr-2 h-5 w-5" /> Cancel Bet
          </Button>
        ) : ( // Condition for Place Bet button
          <Button
            onClick={handlePlaceBet}
            disabled={isGameActive || betAmount <= 0 || betAmount > userBalance}
            className="w-full h-12 text-lg font-bold bg-game-primary hover:bg-game-primary/80"
          >
            Place Bet
          </Button>
        )}
        
        <div className="text-sm text-gray-400 text-right">
          Balance: ${userBalance.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;
