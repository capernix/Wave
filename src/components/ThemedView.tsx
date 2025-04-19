import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedViewProps extends ViewProps {
  variant?: 'primary' | 'background' | 'card';
}

/**
 * A themed View component that adapts to the current mode
 */
const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  variant = 'background',
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  
  // Get color based on variant
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