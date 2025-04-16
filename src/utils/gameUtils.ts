
import { GameState } from '@/hooks/useGameState';

export const checkForAutoCashouts = (
  currentMultiplier: number,
  gameState: {
    activeBet: number | null;
    activeBetAutoCashout: number | null;
    isCashedOut: boolean;
  },
  handleCashout: () => void
) => {
  if (
    gameState.activeBet !== null && 
    gameState.activeBetAutoCashout !== null && 
    currentMultiplier >= gameState.activeBetAutoCashout && 
    !gameState.isCashedOut
  ) {
    handleCashout();
  }
};
