import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0A1128', height: 55, borderTopColor: '#2a3550' },
      tabBarActiveTintColor: '#D4AF37',
      tabBarInactiveTintColor: '#64748B'
    }}>
      <Tabs.Screen name="index" options={{ title: 'الرئيسية', tabBarIcon: ({ color }) => <Text style={{fontSize:22,color}}>🏠</Text> }} />
    </Tabs>
  );
}
