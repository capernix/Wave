import React from 'react';
import { Animated, StyleSheet, Text, TextProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedTextProps extends TextProps {
  variant?: 'header' | 'subheader' | 'body' | 'caption' | 'button';
  color?: 'primary' | 'accent' | 'text';
  animated?: boolean;
}

/**
 * A themed Text component that adapts to the current mode
 * Now supports animated transitions between modes
 */
const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  variant = 'body',
  color = 'text',
  animated = true, // Default to animated transitions
  children,
  ...rest
}) => {
  const { theme, animatedTheme } = useTheme();
  
  // Get text color based on color prop (non-animated)
  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return theme.primary;
      case 'accent':
        return theme.accent;
      case 'text':
      default:
        return theme.text;
    }
  };
  
  // Get animated text color
  const getAnimatedTextColor = () => {
    switch (color) {
      case 'primary':
        return animatedTheme.primary;
      case 'accent':
        return animatedTheme.accent;
      case 'text':
      default:
        return animatedTheme.text;
    }
  };
  
  // Get text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'header':
        return styles.header;
      case 'subheader':
        return styles.subheader;
      case 'caption':
        return styles.caption;
      case 'button':
        return styles.button;
      case 'body':
      default:
        return styles.body;
    }
  };
  
  // Use animated text if animations are enabled
  if (animated) {
    return (
      <Animated.Text
        style={[
          getTextStyle(),
          { color: getAnimatedTextColor() },
          style
        ]}
        {...rest}
      >
        {children}
      </Animated.Text>
    );
  }
  
  // Use regular text if animations are disabled
  return (
    <Text
      style={[
        getTextStyle(),
        { color: getTextColor() },
        style
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 6,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 12,
    opacity: 0.8,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ThemedText;