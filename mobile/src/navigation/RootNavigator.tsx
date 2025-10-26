import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { EstimationFlow } from '@/screens/EstimationFlow';
import { HomeScreen } from '@/screens/HomeScreen';
import { ProjectDetailScreen } from '@/screens/ProjectDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Estimation: undefined;
  ProjectDetail: { projectId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerStyle: { backgroundColor: '#0D1B2A' },
      headerTintColor: '#FFFFFF',
      contentStyle: { backgroundColor: '#F6F7FB' }
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Сметный мастер' }} />
    <Stack.Screen name="Estimation" component={EstimationFlow} options={{ title: 'Новая смета' }} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Черновик сметы' }} />
  </Stack.Navigator>
);
