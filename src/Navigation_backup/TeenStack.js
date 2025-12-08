// src/navigation/TeenStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeenDashboard from '../screens/TeenDashboard';
import TripHistory from '../screens/TripHistory';

const Stack = createNativeStackNavigator();

export default function TeenStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={TeenDashboard} />
      <Stack.Screen name="Trip History" component={TripHistory} />
    </Stack.Navigator>
  );
}
