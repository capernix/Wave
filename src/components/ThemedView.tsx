import React from 'react';
import { Animated, StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedViewProps extends ViewProps {
  variant?: 'primary' | 'background' | 'card';
  animated?: boolean;
}

/**
 * A themed View component that adapts to the current mode
 * Now supports animated transitions between modes
 */
const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  variant = 'background',
  animated = true, // Default to animated transitions
  children,
  ...rest
}) => {
  const { theme, animatedTheme } = useTheme();
  
  // Get color based on variant (non-animated)
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'card':
        return theme.card;
      case 'background':
      default:
        return theme.background;
    }
  };
  
  // Get animated color based on variant
  const getAnimatedBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return animatedTheme.primary;
      case 'card':
        return animatedTheme.card;
      case 'background':
      default:
        return animatedTheme.background;
    }
  };
  
  // Use animated view if animations are enabled
  if (animated) {
    return (
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: getAnimatedBackgroundColor() },
          style
        ]}
        {...rest}
      >
        {children}
      </Animated.View>
    );
  }
  
  // Use regular view if animations are disabled
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        style
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemedView;