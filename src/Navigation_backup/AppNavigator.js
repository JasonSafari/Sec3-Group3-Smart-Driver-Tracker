// src/navigation/AppNavigator.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import TeenStack from './TeenStack';
import ParentStack from './ParentStack';

export default function AppNavigator() {
  const [userType, setUserType] = useState(null); // 'teen' | 'parent' | null

  return (
    <NavigationContainer>
      {userType === 'teen' ? <TeenStack /> :
       userType === 'parent' ? <ParentStack /> :
       <AuthStack />}
    </NavigationContainer>
  );
}
