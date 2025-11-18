// src/navigation/ParentStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ParentDashboard from '../Views/ParentDashboard';
import TeenProgress from '../Views/TeenProgress';

const Stack = createNativeStackNavigator();

export default function ParentStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={ParentDashboard} />
      <Stack.Screen name="TeenProgress" component={TeenProgress} />
    </Stack.Navigator>
  );
}