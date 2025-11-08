import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TeacherScreen from "../screens/TeacherScreen";
import CourseDetailScreen from "../components/CourseDetailScreen";
import { Course, Teacher } from "../types/type";

export type TeacherStackParamList = {
  TeacherHome: undefined;
  CourseDetail: { course: Course; teacher: Teacher };
  CourseCreate: { teacherid: number };
};

const Stack = createNativeStackNavigator<TeacherStackParamList>();

const TeacherStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherHome" component={TeacherScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
    </Stack.Navigator>
  );
};

export default TeacherStack;
