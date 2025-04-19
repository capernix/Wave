import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AudioVisualizer from './AudioVisualizer';

type ModeToggleButtonProps = {
  size?: number;
  onPress?: () => void;
};

/**
 * Button for toggling between Growth and Action modes
 */
const ModeToggleButton: React.FC<ModeToggleButtonProps> = ({
  size = 80,
  onPress
}) => {
  const { theme, mode, toggleMode, audioEnabled } = useTheme();
  
  // Scale animation for press effect
  const handlePress = () => {
    // Call the toggleMode function from context
    if (onPress) {
      onPress();
    } else {
      toggleMode();
    }
  };
  
  // Get icon based on current mode
  const getIcon = () => {
    if (mode === 'growth') {
      return 'leaf';
    } else {
      return 'bolt';
    }
  };
  
  // Calculate sizes based on provided size prop
  const buttonSize = size;
  const iconSize = size * 0.4;
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: mode === 'growth' ? theme.primary : theme.accent,
          }
        ]}
      >
        <View style={styles.iconContainer}>
          <FontAwesome 
            name={getIcon()} 
            size={iconSize} 
            color="#fff" 
          />
        </View>
        
        {audioEnabled && (
          <View style={styles.audioVisualizerContainer}>
            <AudioVisualizer 
              type={mode === 'growth' ? 'circle' : 'bars'} 
              size={buttonSize * 1.2}
              intensity={0.7}
            />
          </View>
        )}
      </TouchableOpacity>
      
      <Text style={[styles.modeText, { color: theme.text }]}>
        {mode === 'growth' ? 'GROWTH' : 'ACTION'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  audioVisualizerContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  modeText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  }
});

export default ModeToggleButton;