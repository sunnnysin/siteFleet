import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { DriverListScreen } from '@/screens/transport/DriverListScreen';
import { DriverDetailScreen } from '@/screens/transport/DriverDetailScreen';
import { AddEditDriverScreen } from '@/screens/transport/AddEditDriverScreen';
import { RouteListScreen } from '@/screens/transport/RouteListScreen';
import { AddEditRouteScreen } from '@/screens/transport/AddEditRouteScreen';
import { FuelPriceScreen } from '@/screens/transport/FuelPriceScreen';
import { DailyEntryListScreen } from '@/screens/transport/DailyEntryListScreen';
import { AddEditDailyEntryScreen } from '@/screens/transport/AddEditDailyEntryScreen';
import { MonthlyPaymentScreen } from '@/screens/transport/MonthlyPaymentScreen';
import type { TransportStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<TransportStackParamList>();

export function TransportStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'SiteFleet' }}
      />
      <Stack.Screen
        name="DriverList"
        component={DriverListScreen}
        options={{ title: 'Drivers' }}
      />
      <Stack.Screen
        name="DriverDetail"
        component={DriverDetailScreen}
        options={{ title: 'Driver' }}
      />
      <Stack.Screen
        name="AddEditDriver"
        component={AddEditDriverScreen}
        options={{ title: 'Driver' }}
      />
      <Stack.Screen
        name="RouteList"
        component={RouteListScreen}
        options={{ title: 'Routes' }}
      />
      <Stack.Screen
        name="AddEditRoute"
        component={AddEditRouteScreen}
        options={{ title: 'Route' }}
      />
      <Stack.Screen
        name="FuelPrice"
        component={FuelPriceScreen}
        options={{ title: "Today's Fuel Price" }}
      />
      <Stack.Screen
        name="DailyEntryList"
        component={DailyEntryListScreen}
        options={{ title: 'Daily Entries' }}
      />
      <Stack.Screen
        name="AddEditDailyEntry"
        component={AddEditDailyEntryScreen}
        options={{ title: 'Daily Entry' }}
      />
      <Stack.Screen
        name="MonthlyPayment"
        component={MonthlyPaymentScreen}
        options={{ title: 'Monthly Payments' }}
      />
    </Stack.Navigator>
  );
}
