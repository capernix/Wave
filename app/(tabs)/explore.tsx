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
          onPress={() => fetch('http://localhost:5000/habit-summary')
          
          }
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Chatbot</Text>
        </TouchableOpacity>
        <TouchableOpacity
  style={{
    backgroundColor: mode === 'growth' ? theme.primary : theme.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
    marginRight: 8,
  }}
  onPress={async () => {
    try {
      const response = await fetch('http://localhost:5000/habit-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
, // Add data here if needed
      });
      const result = await response.json();
      console.log('Summary result:', result);
      // triggerHaptic?.('success');
    } catch (error) {
      console.error('Error fetching habit summary:', error);
      // triggerHaptic?.('error');
    }
  }}
>
  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Chatbot</Text>
</TouchableOpacity>

      </View>
    </View>
  );
}
