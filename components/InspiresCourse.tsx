import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FaRegStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Teacher, Course, User } from "../types/type";
import { RootState } from "../auth/store";

interface InspiresCourseProps {
  course: Course;
  teachers?: Teacher[];
  onPress?: () => void;
  onEdit?: () => void;
}

export const InspiresCourse = ({
  course,
  teachers = [],
  onPress,
}: InspiresCourseProps) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const teacher = teachers.find(
    (t) => String(t.id) === String(course.teacherid)
  );
  const teacherName = teacher ? teacher.name : "Unknown";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: course.image }} style={styles.image} />

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {course.name}
          </Text>

          
        </View>

        <Text style={styles.teacher}>{teacherName}</Text>
        <Text style={styles.price}>
          {course.price.toLocaleString("vi-VN")}₫
        </Text>

        <View style={styles.row}>
          <FaRegStar color="#FFD700" />
          <Text style={styles.vote}>
            {course.vote} ({course.votecount})
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.lesson}>{course.lessoncount} bài học</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 6,
    resizeMode: "cover",
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    flexShrink: 1,
  },
  teacher: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  price: {
    color: "#00BCD4",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  vote: {
    fontSize: 12,
    color: "#555",
    marginLeft: 4,
  },
  dot: {
    fontSize: 14,
    color: "#999",
    marginHorizontal: 4,
  },
  lesson: {
    fontSize: 12,
    color: "#555",
  },
  bookmark: {
    position: "relative",
    top: 20,
  },
});
