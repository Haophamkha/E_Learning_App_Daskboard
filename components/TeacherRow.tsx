import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Image,
} from "react-native";
import { Teacher } from "../types/type";

interface Props {
  item: Teacher;
  stt: number;
  isEditing: boolean;
  editForm: Partial<Teacher> | null;
  onEditField: (field: keyof Teacher, value: any) => void;
  onStartEdit: (t: Teacher) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDeletePress: (t: Teacher) => void;
  onStatusChange: (id: number, status: "active" | "inactive") => void;
  columnWidths?: Partial<Record<keyof Teacher | "actions", number>>;
}

export const TeacherRow: React.FC<Props> = ({
  item,
  stt, // 👈 nhận STT
  isEditing,
  editForm,
  onEditField,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeletePress,
  onStatusChange,
  columnWidths = {},
}) => {
  return (
    <View style={styles.tableRow}>
      {/* STT */}
      <Text style={[styles.tableCell, { width: columnWidths.id }]}>{stt}</Text>

      {/* Image */}
      <View style={[styles.tableCell, { width: columnWidths.image }]}>
        <Image
          source={{ uri: item.image }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      </View>

      {/* Name */}
      <View style={[styles.tableCell, { width: columnWidths.name }]}>
        {isEditing ? (
          <TextInput
            value={editForm?.name}
            onChangeText={(v) => onEditField("name", v)}
            style={styles.input}
          />
        ) : (
          <Text>{item.name}</Text>
        )}
      </View>

      {/* Job */}
      <View style={[styles.tableCell, { width: columnWidths.job }]}>
        {isEditing ? (
          <TextInput
            value={editForm?.job}
            onChangeText={(v) => onEditField("job", v)}
            style={styles.input}
          />
        ) : (
          <Text>{item.job}</Text>
        )}
      </View>

      {/* Username */}
      <View style={[styles.tableCell, { width: columnWidths.username }]}>
        {isEditing ? (
          <TextInput
            value={editForm?.username}
            onChangeText={(v) => onEditField("username", v)}
            style={styles.input}
          />
        ) : (
          <Text>{item.username}</Text>
        )}
      </View>

      {/* Password */}
      <View style={[styles.tableCell, { width: columnWidths.password }]}>
        {isEditing ? (
          <TextInput
            value={editForm?.password}
            onChangeText={(v) => onEditField("password", v)}
            style={styles.input}
            secureTextEntry={false}
          />
        ) : (
          <Text>{item.password}</Text>
        )}
      </View>

      {/* Location */}
      <View style={[styles.tableCell, { width: columnWidths.location }]}>
        {isEditing ? (
          <TextInput
            value={editForm?.location}
            onChangeText={(v) => onEditField("location", v)}
            style={styles.input}
          />
        ) : (
          <Text>{item.location}</Text>
        )}
      </View>

      {/* Timework */}
      <View style={[styles.tableCell, { width: columnWidths.timework }]}>
        {isEditing ? (
          <TextInput
            value={editForm?.timework}
            onChangeText={(v) => onEditField("timework", v)}
            style={styles.input}
          />
        ) : (
          <Text>{item.timework}</Text>
        )}
      </View>

      {/* School */}
      <View style={[styles.tableCell, { width: columnWidths.school }]}>
        {isEditing ? (
          <TextInput
            value={editForm?.school}
            onChangeText={(v) => onEditField("school", v)}
            style={styles.input}
          />
        ) : (
          <Text>{item.school}</Text>
        )}
      </View>

      {/* Status */}
      <View style={[styles.tableCell, { width: columnWidths.status }]}>
        <Switch
          value={item.status === "active"}
          onValueChange={(val) =>
            onStatusChange(item.id, val ? "active" : "inactive")
          }
        />
      </View>

      {/* Actions */}
      <View
        style={[
          styles.tableCell,
          { width: columnWidths.actions, flexDirection: "row", gap: 8 },
        ]}
      >
        {isEditing ? (
          <>
            <TouchableOpacity onPress={onSaveEdit} style={styles.button}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancelEdit}
              style={styles.buttonCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => onStartEdit(item)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onDeletePress(item)}
              style={styles.buttonCancel}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 8,
  },
  tableCell: {
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  buttonCancel: {
    backgroundColor: "#ef4444",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});
