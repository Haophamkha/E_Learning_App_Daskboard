import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <View style={styles.paginationRow}>
    <TouchableOpacity
      style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}
      onPress={onPrev}
      disabled={currentPage === 1}
    >
      <Text style={styles.pageBtnText}>Previous</Text>
    </TouchableOpacity>
    <View style={styles.pageNumberBox}>
      <Text style={styles.pageNumberText}>
        {currentPage} / {totalPages}
      </Text>
    </View>
    <TouchableOpacity
      style={[styles.pageBtn, currentPage === totalPages && styles.disabledBtn]}
      onPress={onNext}
      disabled={currentPage === totalPages}
    >
      <Text style={styles.pageBtnText}>Next</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  pageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    marginHorizontal: 10,
  },
  disabledBtn: { backgroundColor: "#cbd5e1" },
  pageBtnText: { color: "white", fontWeight: "700" },
  pageNumberBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pageNumberText: { fontWeight: "700", color: "#111827" },
});
