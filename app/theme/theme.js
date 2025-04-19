export const theme = {
  colors: {
    // Core section colors
    primary: {
      teal: '#008080',        // Mood Growth - Teal
      lavender: '#E6E6FA',    // Mood Growth - Lavender
      orange: '#FFA500',      // Action - Orange
      navy: '#003366',        // Action - Navy Blue
    },
    // Background colors
    background: {
      primary: '#FFFFFF',     // Pure white
      secondary: '#F8F8FF',   // Very light lavender
      tertiary: '#F5F5F5',    // Light gray
      mood: '#F0F8FF',        // Light teal tint
      action: '#F5F5FF',      // Light navy tint
      card: '#FFFFFF',        // Card backgrounds
      modal: 'rgba(0,0,0,0.5)', // Modal overlay
    },
    // Text colors
    text: {
      primary: '#1A1A1A',     // Almost black
      secondary: '#4A4A4A',   // Dark gray
      tertiary: '#666666',    // Medium gray
      inverse: '#FFFFFF',     // White text
      mood: '#008080',        // Teal for mood text
      action: '#003366',      // Navy for action text
      placeholder: '#999999', // Placeholder text
    },
    // Status colors
    status: {
      success: '#008080',     // Teal for success
      info: '#E6E6FA',        // Lavender for info
      warning: '#FFA500',     // Orange for warning
      error: '#FF5E57',       // Red for error
      action: '#003366',      // Navy for action
    },
    // UI Elements
    border: {
      light: '#E6E6FA',       // Light lavender border
      medium: '#D3D3D3',      // Medium gray border
      dark: '#003366',        // Navy border
    },
    // Special effects
    effects: {
      glass: 'rgba(230,230,250,0.8)',  // Lavender glass effect
      shadow: 'rgba(0,0,0,0.1)',
      overlay: 'rgba(0,0,0,0.3)',
      moodGlow: 'rgba(0,128,128,0.1)', // Teal glow for Mood
      actionGlow: 'rgba(0,51,102,0.1)', // Navy glow for Action
    },
    // Interactive elements
    interactive: {
      button: {
        primary: '#008080',   // Teal for primary buttons
        secondary: '#E6E6FA', // Lavender for secondary buttons
        action: '#FFA500',    // Orange for action buttons
        disabled: '#CCCCCC',  // Gray for disabled state
      },
      input: {
        background: '#FFFFFF',
        border: '#E6E6FA',
        focus: '#008080',
      },
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
      bold: '700',
    },
    fonts: {
      primary: 'System',
      secondary: 'System',
    },
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
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
    }
  },
  // Card styles
  cards: {
    primary: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    interactive: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#008080',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
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