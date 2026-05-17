import { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { LoginScreen }     from '../screens/AuthStack/LoginScreen';
import { DashboardScreen } from '../screens/MainStack/DashboardScreen';
import { QuestsScreen }    from '../screens/MainStack/QuestsScreen';
import { SageScreen }      from '../screens/MainStack/SageScreen';
import { colors }          from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const PixelTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background:  colors.bgDeep,
    card:        colors.bgPanel,
    text:        colors.textPrimary,
    border:      colors.borderPixel,
    primary:     colors.accentGold,
    notification:colors.accentRed,
  },
};

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:     false,
        tabBarStyle:     { backgroundColor: colors.bgPanel, borderTopColor: colors.borderPixel, borderTopWidth: 2 },
        tabBarActiveTintColor:   colors.accentGold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle:{ fontFamily: 'monospace', fontSize: 8 },
      }}
    >
      <Tab.Screen
        name="Castillo"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏰" focused={focused} /> }}
      />
      <Tab.Screen
        name="Misiones"
        component={QuestsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📜" focused={focused} /> }}
      />
      <Tab.Screen
        name="Sabio"
        component={SageScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🧙" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading, bootstrap } = useAuthStore();

  useEffect(() => { bootstrap(); }, [bootstrap]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgDeep }}>
        <Text style={{ fontFamily: 'monospace', color: colors.accentGold, fontSize: 14 }}>CARGANDO...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={PixelTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
