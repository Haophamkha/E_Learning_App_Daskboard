import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { store } from "./auth/store";

import { RootStackParamList } from "./types/type";
import LoginScreen from "./screens/LoginScreen";
import AdminScreen from "./screens/AdminScreen";
import TeacherStack from "./components/TeacherStack";
import CourseCreateScreen from "./components/CourseCreateScreen";
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Teacher"
            component={TeacherStack}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CourseCreate"
            component={CourseCreateScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
