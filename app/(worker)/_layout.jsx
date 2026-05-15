import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={styles.tabItem}>
      <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

export default function WorkerLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}>
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Dashboard" focused={focused} /> }} />
      <Tabs.Screen name="schedule" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📅" label="Schedule" focused={focused} /> }} />
      <Tabs.Screen name="availability" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⏰" label="Availability" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.charcoalDeep, borderTopWidth: 1, borderTopColor: Colors.darkBorder,
    height: 72, paddingBottom: 8, paddingTop: 8, elevation: 12,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600' },
  tabLabelActive: { color: Colors.goldPrimary, fontWeight: '700' },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.goldPrimary, marginTop: 2 },
});
