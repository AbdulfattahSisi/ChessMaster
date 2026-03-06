import React from "react";
import { StatusBar } from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import { SettingsProvider } from "./src/contexts/SettingsContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <AppNavigator />
      </SettingsProvider>
    </AuthProvider>
  );
}
