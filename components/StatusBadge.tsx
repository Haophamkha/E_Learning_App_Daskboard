import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const StatusBadge = ({
  status,
}: {
  status?: "active" | "inactive" | string;
}) => {
  if (!status) return null;
  const bgColor =
    status === "active" || status.toLowerCase() === "online"
      ? "#d1e7dd"
      : "#f8d7da";
  const textColor =
    status === "active" || status.toLowerCase() === "online"
      ? "#0f5132"
      : "#842029";

  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
      <Text style={[styles.statusText, { color: textColor }]}>
        {status.toString().toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "center",
  },
  statusText: { fontWeight: "600", fontSize: 12 },
});
