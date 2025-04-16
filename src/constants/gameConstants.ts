
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

// Completely revised multiplier system
export const MULTIPLIER_UPDATE_INTERVAL = 50; // ms - Even faster updates
export const MULTIPLIER_BASE = 1.0015; // Higher base value
export const MULTIPLIER_GROWTH_SPEED = 0.25; // Controls how quickly the multiplier increases

// Colors for game elements
export const GAME_COLORS = {
  GRID: 'rgba(255, 255, 255, 0.1)',
  PATH_FILL_TOP: 'rgba(255, 87, 34, 0.7)',
  PATH_FILL_BOTTOM: 'rgba(255, 87, 34, 0.1)',
  PATH_STROKE_START: '#FFC107',
  PATH_STROKE_END: '#FF9800',
  MULTIPLIER_BASE: '#4CAF50',
  MULTIPLIER_HIGH: '#FF5722',
  CRASHED: '#FF5252',
  PATH_SHADOW: 'rgba(255, 193, 7, 0.6)', // Added for path glow
  TRAJECTORY_LINE: '#FF9800' // Added for trajectory visualization
};

// Enhanced trajectory visualization settings
export const TRAJECTORY = {
  SHOW_PREDICTION: true,
  PREDICTION_POINTS: 50, // More points for smoother trajectory
  PREDICTION_OPACITY: 0.6, // Higher opacity for better visibility
  DOT_SIZE: 4, // Larger dots
  DOT_SPACING: 10 // Closer spacing for more continuous line
};
