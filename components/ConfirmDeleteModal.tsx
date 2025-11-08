import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const ConfirmDeleteModal = ({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Hủy thay đổi</Text>
        <Text style={styles.message}>
          Bạn có chắc muốn xóa giáo viên này không. Mọi thay đổi không thể quay lại.
        </Text>

        <View style={styles.line} />

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "40%", // nhỏ gọn hơn
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 16,
  },
  line: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 12,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderColor: "#d1d5db",
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  confirmButton: {
    backgroundColor: "#34d399",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  cancelText: {
    color: "#111827",
    fontWeight: "500",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
});
