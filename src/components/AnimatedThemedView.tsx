import React from 'react';
import { Animated, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface AnimatedThemedViewProps extends ViewProps {
  variant?: 'primary' | 'background' | 'card';
  animateScale?: boolean;
  animateOpacity?: boolean;
  scaleRange?: [number, number]; // [from, to]
  opacityRange?: [number, number]; // [from, to]
  transformProps?: {
    translateX?: [number, number];
    translateY?: [number, number];
    rotate?: [string, string];
  };
}

// Interface for our animated style to fix TypeScript errors
interface AnimatedStyle {
  backgroundColor: any;
  transform?: any[];
  opacity?: any;
}

/**
 * An animated themed View component that provides smooth transitions between modes
 */
const AnimatedThemedView: React.FC<AnimatedThemedViewProps> = ({
  style,
  variant = 'background',
  animateScale = false,
  animateOpacity = false,
  scaleRange = [1, 1.05],
  opacityRange = [1, 1],
  transformProps,
  children,
  ...rest
}) => {
  const { animatedTheme, transitionProgress, nativeTransitionProgress } = useTheme();
  
  // Get animated color based on variant
  const getBackgroundColor = () => {
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
  
  // Configure native-driven animations with proper typing
  const animatedStyle: AnimatedStyle = {
    backgroundColor: getBackgroundColor(),
  };
  
  // Create transform array for scale animation
  if (animateScale) {
    animatedStyle.transform = [{
      scale: nativeTransitionProgress.interpolate({
        inputRange: [0, 1],
        outputRange: scaleRange,
        extrapolate: 'clamp',
      })
    }];
  }
  
  // Add opacity animation
  if (animateOpacity) {
    animatedStyle.opacity = nativeTransitionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: opacityRange,
      extrapolate: 'clamp',
    });
  }
  
  // Add additional transforms if specified
  if (transformProps) {
    const transforms: any[] = [];
    
    if (transformProps.translateX) {
      transforms.push({
        translateX: nativeTransitionProgress.interpolate({
          inputRange: [0, 1],
          outputRange: transformProps.translateX,
          extrapolate: 'clamp',
        })
      });
    }
    
    if (transformProps.translateY) {
      transforms.push({
        translateY: nativeTransitionProgress.interpolate({
          inputRange: [0, 1],
          outputRange: transformProps.translateY,
          extrapolate: 'clamp',
        })
      });
    }
    
    if (transformProps.rotate) {
      transforms.push({
        rotate: nativeTransitionProgress.interpolate({
          inputRange: [0, 1],
          outputRange: transformProps.rotate,
          extrapolate: 'clamp',
        })
      });
    }
    
    // Combine transforms
    if (animatedStyle.transform) {
      animatedStyle.transform = [...transforms, ...animatedStyle.transform];
    } else {
      animatedStyle.transform = transforms;
    }
  }
  
  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        style
      ]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedThemedView;