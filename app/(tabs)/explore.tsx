import { StyleSheet, View, TouchableOpacity, Text, Linking } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabTwoScreen() {
  const { theme, mode } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: 40 }}>
      <View style={{ flexDirection: 'row', gap: 16, marginVertical: 24, justifyContent: 'center' }}>
        <TouchableOpacity
          style={{
            backgroundColor: mode === 'growth' ? theme.primary : theme.accent,
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 20,
            marginRight: 8
          }}
          onPress={() => {/* Navigate to chatbot or show chatbot UI */}}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Chatbot</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 20
          }}
          onPress={() => fetch('http://localhost:5000/call-me')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Call Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
