import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Gamepad2, Bell, TrendingUp, ClipboardList } from 'lucide-react-native';

import DashboardScreen from '../screens/DashboardScreen';
import DemoScreen from '../screens/DemoScreen';
import AlertsScreen from '../screens/AlertsScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Demo" 
        component={DemoScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Gamepad2 color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Alertas" 
        component={AlertsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Análisis" 
        component={AnalysisScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Historial" 
        component={HistoryScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
