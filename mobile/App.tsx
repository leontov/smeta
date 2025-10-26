import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useBootstrap } from '@/state/bootstrap';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  const { isReady } = useBootstrap();

  return (
    <SafeAreaProvider>
      {!isReady ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0D1B2A'
          }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
