
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

export const MULTIPLIER_UPDATE_INTERVAL = 50;
export const MULTIPLIER_GROWTH_SPEED = 0.35; // Increased for faster growth

export const GAME_COLORS = {
  GRID: 'rgba(255, 255, 255, 0.1)',
  PATH_FILL_TOP: 'rgba(255, 87, 34, 0.7)',
  PATH_FILL_BOTTOM: 'rgba(255, 87, 34, 0.1)',
  PATH_STROKE_START: '#FFC107',
  PATH_STROKE_END: '#FF9800',
  MULTIPLIER_BASE: '#4CAF50',
  MULTIPLIER_HIGH: '#FF5722',
  CRASHED: '#FF5252',
  PATH_SHADOW: 'rgba(255, 193, 7, 0.6)',
  TRAJECTORY_LINE: '#FF9800' // Added for trajectory visualization
};

// Minimal trajectory settings
export const TRAJECTORY = {
  SHOW_PREDICTION: true,
  PREDICTION_POINTS: 20,
  PREDICTION_OPACITY: 0.5,
  DOT_SIZE: 3,
  DOT_SPACING: 8
};
