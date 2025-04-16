
export const GAME_CANVAS = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 450,
  MARGINS: {
    TOP: 50,
    BOTTOM: 50,
    LEFT: 50,
    RIGHT: 50
  }
};

// Adjusted for smoother animation
export const MULTIPLIER_UPDATE_INTERVAL = 100; // ms - Faster update for smoother animation
export const MULTIPLIER_BASE = 1.00075; // Slower growth rate for more predictable path
export const MULTIPLIER_FACTOR = 120; // Higher factor for more dramatic curve

// Colors for game elements
export const GAME_COLORS = {
  GRID: 'rgba(255, 255, 255, 0.1)',
  PATH_FILL_TOP: 'rgba(255, 87, 34, 0.7)',
  PATH_FILL_BOTTOM: 'rgba(255, 87, 34, 0.1)',
  PATH_STROKE_START: '#FFC107',
  PATH_STROKE_END: '#FF9800',
  MULTIPLIER_BASE: '#4CAF50',
  MULTIPLIER_HIGH: '#FF5722',
  CRASHED: '#FF5252'
};
