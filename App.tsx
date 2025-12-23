import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionProvider } from './src/context/TransactionContext';
import { ProjectProvider } from './src/context/ProjectContext';
import { MaterialProvider } from './src/context/MaterialContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import DashboardScreen from './src/screens/DashboardScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import ProjectManagementScreen from './src/screens/ProjectManagementScreen';
import AddProjectScreen from './src/screens/AddProjectScreen';
import MaterialManagementScreen from './src/screens/MaterialManagementScreen';
import ReportingScreen from './src/screens/ReportingScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type RootTabParamList = {
  Dashboard: undefined;
  Add: undefined;
  History: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Projects: undefined;
  AddProject: undefined;
  MaterialManagement: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Projects') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingHorizontal: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
          paddingHorizontal: 0,
          marginHorizontal: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -2,
          marginBottom: 2,
        },
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Add" component={AddTransactionScreen} />
      <Tab.Screen name="History" component={TransactionHistoryScreen} />
      <Tab.Screen name="Reports" component={ReportingScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar
          barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
          backgroundColor="#2196F3"
        />
        <MaterialProvider>
          <ProjectProvider>
            <TransactionProvider>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{
                    headerStyle: {
                      backgroundColor: '#2196F3',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                    headerBackTitle: 'Back',
                    headerBackTitleStyle: {
                      fontSize: 16,
                    },
                  }}
                >
                  <Stack.Screen
                    name="Main"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Projects"
                    component={ProjectManagementScreen}
                    options={{
                      title: 'Manage Projects',
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen
                    name="AddProject"
                    component={AddProjectScreen}
                    options={{
                      title: 'Add Project',
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen
                    name="MaterialManagement"
                    component={MaterialManagementScreen}
                    options={{
                      title: 'Manage Materials',
                      presentation: 'card',
                    }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </TransactionProvider>
          </ProjectProvider>
        </MaterialProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
