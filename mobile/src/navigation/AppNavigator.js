import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";

// Auth Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// Main Screens
import HomeScreen from "../screens/HomeScreen";
import DifficultySelectScreen from "../screens/DifficultySelectScreen";
import GameScreen from "../screens/GameScreen";
import PuzzleListScreen from "../screens/PuzzleListScreen";
import PuzzleSolveScreen from "../screens/PuzzleSolveScreen";
import AnalysisScreen from "../screens/AnalysisScreen";
import OpeningsScreen from "../screens/OpeningsScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import StatsScreen from "../screens/StatsScreen";
import ExportScreen from "../screens/ExportScreen";

// v2.0 Screens
import AchievementsScreen from "../screens/AchievementsScreen";
import GameReviewScreen from "../screens/GameReviewScreen";
import DailyChallengeScreen from "../screens/DailyChallengeScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.secondary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: "bold" },
};

function TabIcon({ routeName, focused, color }) {
  const size = focused ? 26 : 22;
  const iconMap = {
    Home: { lib: Ionicons, name: "home", focusedName: "home" },
    Puzzles: { lib: MaterialCommunityIcons, name: "puzzle-outline", focusedName: "puzzle" },
    Analyze: { lib: MaterialCommunityIcons, name: "magnify-scan", focusedName: "magnify-scan" },
    Ranking: { lib: Ionicons, name: "trophy-outline", focusedName: "trophy" },
    Profile: { lib: Ionicons, name: "stats-chart-outline", focusedName: "stats-chart" },
  };
  const icon = iconMap[routeName] || { lib: Ionicons, name: "ellipse", focusedName: "ellipse" };
  const IconComponent = icon.lib;
  const iconName = focused ? icon.focusedName : icon.name;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <IconComponent name={iconName} size={size} color={color} />
      {focused && (
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: COLORS.accent,
            marginTop: 3,
          }}
        />
      )}
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon routeName={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: "rgba(15,14,36,0.97)",
          borderTopColor: "rgba(108,99,255,0.15)",
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 85 : 65,
          elevation: 20,
          shadowColor: COLORS.accent,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.5,
          marginTop: -2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Puzzles" component={PuzzleListScreen} />
      <Tab.Screen name="Analyze" component={AnalysisScreen} />
      <Tab.Screen name="Ranking" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={StatsScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DifficultySelect"
        component={DifficultySelectScreen}
        options={{ title: "Choose Difficulty" }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ title: "Game", headerBackVisible: false }}
      />
      <Stack.Screen
        name="PuzzleSolve"
        component={PuzzleSolveScreen}
        options={{ title: "Solve Puzzle" }}
      />
      <Stack.Screen
        name="Openings"
        component={OpeningsScreen}
        options={{ title: "Openings Library" }}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{ title: "Export Games" }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GameReview"
        component={GameReviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DailyChallenge"
        component={DailyChallengeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}