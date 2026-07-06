import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from '@/components/TabBarIcon';
import { TransportStackNavigator } from '@/navigation/TransportStackNavigator';
import { ConstructionScreen } from '@/screens/ConstructionScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { colors } from '@/theme/colors';
import transportIcon from '@/assets/transport.png';
import constructionIcon from '@/assets/construction.png';
import profileIcon from '@/assets/profile.png';
import type { MainTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerTitleAlign: 'center',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Transport"
        component={TransportStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon source={transportIcon} isFocused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Construction"
        component={ConstructionScreen}
        options={{
          headerShown: true,
          title: 'Construction',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon source={constructionIcon} isFocused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon source={profileIcon} isFocused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
