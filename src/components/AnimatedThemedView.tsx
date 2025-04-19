import React from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

interface Props {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const AnimatedThemedView: React.FC<Props> = ({ children, style }) => {
  const backgroundColor = useThemeColor('background');
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [backgroundColor]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          backgroundColor,
          opacity: animatedValue,
          transform: [{
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            })
          }]
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};