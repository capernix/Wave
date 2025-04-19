export const theme = {
  colors: {
    // Primary colors
    primary: '#FFFFFF',     // Pure white
    secondary: '#F7F7F7',   // Light gray
    accent: {
      green: '#2ECC71',     // Bright green
      orange: '#FF9F43',    // Warm orange
      blue: '#3498DB',      // Water blue
      yellow: '#F1C40F',    // Progress yellow
    },

    // Background colors
    background: {
      primary: '#FFFFFF',   // Pure white
      secondary: '#F7F7F7', // Light gray
      tertiary: '#E5E5E5',  // Slightly darker gray
    },

    // Text colors
    text: {
      primary: '#000000',   // Black text
      secondary: '#555555', // Dark gray
      tertiary: '#888888',  // Medium gray
      inverse: '#FFFFFF',   // White text
    },

    // Status colors
    status: {
      success: '#2ECC71',   // Green
      warning: '#FF9F43',   // Orange
      error: '#FF5E57',     // Red
      info: '#3498DB',      // Blue
    },

    // Special effects
    effects: {
      glass: 'rgba(255,255,255,0.8)',
      shadow: 'rgba(0,0,0,0.1)',
      overlay: 'rgba(0,0,0,0.05)',
      cardGlow: 'rgba(46,204,113,0.15)', // Green glow for cards
    }
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      xxxl: 48,
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 9999,
  },

  // Shadows for different elevations
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
    }
  },

  // Card styles
  cards: {
    primary: {
      backgroundColor: '#F7F7F7',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
    },
    interactive: {
      backgroundColor: '#E5E5E5',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#2ECC71',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    }
  },

  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  }
};
