import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { CATEGORIES } from "../types/type";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../auth/store";
import { Teacher, Course } from "../types/type";
import {
  updateTeacherAsync,
  fetchCoursesAsync,
  updateCourseAsync,
  addCourseAsync,
} from "../auth/dataSlice";
import { logout } from "../auth/authSlice";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { InspiresCourse } from "../components/InspiresCourse";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TeacherStackParamList } from "../components/TeacherStack";
import { Alert, Platform, ToastAndroid } from "react-native";
type NavigationProp = NativeStackNavigationProp<
  TeacherStackParamList,
  "TeacherHome"
>;
const Tab = createBottomTabNavigator();

const showNotification = (title: string, message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(title, message);
  }
};
const CourseModal = ({
  course,
  visible,
  onClose,
  onSave,
}: {
  course?: Course | null;
  visible: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentTeacher = useSelector(
    (state: RootState) => state.auth.currentUser as Teacher | null
  );

  const isEdit = !!course;
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Partial<Course>>(
    course
      ? {
          name: course.name,
          price: course.price,
          discount: course.discount ?? 0,
          category: course.category,
          duration: course.duration ?? "",
          description: course.description ?? "",
          image: course.image,
          lessoncount: course.lessoncount,
          project: {
            description: course.project?.description ?? "",
            studentproject: course.project?.studentproject ?? [],
          },
          teacherid: course.teacherid,
          vote: course.vote,
          votecount: course.votecount,
          likes: course.likes,
          share: course.share,
          chapters: course.chapters,
          qa: course.qa,
          reviews: course.reviews,
        }
      : {
          name: "",
          price: 0,
          discount: 0,
          category: CATEGORIES[0],
          duration: "",
          description: "",
          image: "https://placehold.co/300x200/cccccc/999999/png",
          lessoncount: 0,
          project: { description: "", studentproject: [] },
          teacherid: currentTeacher?.id || 0,
          vote: 0,
          votecount: 0,
          likes: 0,
          share: 0,
          chapters: [],
          qa: [],
          reviews: [],
        }
  );

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setUploading(true);
        setForm((p) => ({ ...p, image: result.assets[0].uri }));
        setTimeout(() => setUploading(false), 500);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const hasChanges = () => {
    if (!isEdit) return !!form.name && (form.price ?? 0) > 0;
    return (
      form.name !== course?.name ||
      form.price !== course?.price ||
      (form.discount ?? 0) !== (course?.discount ?? 0) ||
      form.category !== course?.category ||
      form.duration !== (course?.duration ?? "") ||
      form.description !== (course?.description ?? "") ||
      form.project?.description !== (course?.project?.description ?? "")
    );
  };

  const handleSave = async () => {
    if (!currentTeacher || !hasChanges()) return;

    const courseData: Course = {
      id: course?.id || 0,
      teacherid: currentTeacher.id,
      name: form.name || "",
      price: form.price ?? 0,
      discount: form.discount ?? 0,
      category: form.category || CATEGORIES[0],
      duration: form.duration || "",
      description: form.description || "",
      image: form.image || "https://placehold.co/300x200/cccccc/999999/png",
      lessoncount: form.lessoncount || 0,
      likes: course?.likes || 0,
      share: course?.share || 0,
      vote: course?.vote ?? 0,
      votecount: course?.votecount ?? 0,
      project: {
        description: form.project?.description || "",
        studentproject: form.project?.studentproject || [],
      },
      chapters: course?.chapters || [],
      qa: course?.qa || [],
      reviews: course?.reviews || [],
    };

    try {
      const result = isEdit
        ? await dispatch(updateCourseAsync(courseData)).unwrap()
        : await dispatch(addCourseAsync(courseData)).unwrap();

      onSave(result);
      showNotification(
        "Thành công",
        isEdit ? "Cập nhật thành công!" : "Tạo khóa học thành công!"
      );
      onClose();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Thao tác thất bại");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>
            {isEdit ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Ảnh + Tên + Giá */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ảnh khóa học</Text>
              <Image
                source={{ uri: form.image }}
                style={styles.modalImagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  uploading && styles.disabledButton,
                ]}
                onPress={pickImage}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={18} color="#fff" />
                    <Text style={styles.uploadButtonText}>Chọn ảnh</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Tên khóa học</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
                  placeholder="Nhập tên..."
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Giá (₫)</Text>
                <TextInput
                  style={styles.input}
                  value={String(form.price ?? 0)}
                  onChangeText={(t) =>
                    setForm((p) => ({ ...p, price: Number(t) || 0 }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Giảm giá (%)</Text>
                <TextInput
                  style={styles.input}
                  value={String(form.discount ?? 0)}
                  onChangeText={(t) =>
                    setForm((p) => ({ ...p, discount: Number(t) || 0 }))
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Danh mục</Text>
                <View style={styles.pickerContainer}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.pickerItem,
                        form.category === cat && styles.pickerItemSelected,
                      ]}
                      onPress={() => setForm((p) => ({ ...p, category: cat }))}
                    >
                      <Text
                        style={[
                          styles.pickerText,
                          form.category === cat && styles.pickerTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thời lượng</Text>
              <TextInput
                style={styles.input}
                value={form.duration}
                onChangeText={(t) => setForm((p) => ({ ...p, duration: t }))}
                placeholder="Ví dụ: 20 giờ"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả khóa học</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.description}
                onChangeText={(t) => setForm((p) => ({ ...p, description: t }))}
                multiline
                placeholder="Nhập mô tả..."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả dự án</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.project?.description}
                onChangeText={(t) =>
                  setForm((p) => ({
                    ...p,
                    project: {
                      description: t,
                      studentproject: p.project?.studentproject || [],
                    },
                  }))
                }
                multiline
                placeholder="Nhập mô tả dự án..."
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !hasChanges() && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={!hasChanges()}
            >
              <Text style={styles.confirmText}>
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// === CoursesTab ===
const CoursesTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentTeacher = useSelector(
    (state: RootState) => state.auth.currentUser as Teacher | null
  );
  const courses = useSelector((state: RootState) => state.data.courses);
  const loading = useSelector((state: RootState) => state.data.loading);
  const navigation = useNavigation<NavigationProp>();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (courses.length === 0 && !loading) {
      dispatch(fetchCoursesAsync());
    }
  }, [dispatch, courses.length, loading]);

  const teacherCourses = currentTeacher
    ? courses.filter((c) => String(c.teacherid) === String(currentTeacher.id))
    : [];

  const handleCoursePress = (course: Course) => {
    if (!currentTeacher) return Alert.alert("Lỗi", "Không tìm thấy giáo viên!");
    navigation.navigate("CourseDetail", { course, teacher: currentTeacher });
  };

  const handleCreateNew = () => {
    if (!currentTeacher) return Alert.alert("Lỗi", "Không tìm thấy giáo viên!");
    navigation.navigate("CourseCreate", { teacherid: currentTeacher.id });
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setModalVisible(true);
  };

  if (!currentTeacher) {
    return (
      <View style={styles.tabContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.tabContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Đang tải khóa học...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContainer}>
      <View style={styles.titleRow}>
        <Text style={styles.tabTitle}>Tất cả khóa học của bạn</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateNew}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Tạo mới</Text>
        </TouchableOpacity>
      </View>

      {teacherCourses.length === 0 ? (
        <Text style={styles.noCoursesText}>Bạn chưa có khóa học nào.</Text>
      ) : (
        <View style={styles.coursesList}>
          {teacherCourses.map((course) => (
            <InspiresCourse
              key={course.id}
              course={course}
              teachers={[currentTeacher]}
              onPress={() => handleCoursePress(course)}
              onEdit={() => handleEditCourse(course)}
            />
          ))}
        </View>
      )}

      <CourseModal
        course={selectedCourse}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={() => setModalVisible(false)}
      />
    </ScrollView>
  );
};

const ProfileTab = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const currentTeacher = useSelector(
    (state: RootState) => state.auth.currentUser as Teacher | null
  );
  const [form, setForm] = useState<Partial<Teacher>>({});
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentTeacher) setForm({ ...currentTeacher });
  }, [currentTeacher]);

  const pickAvatar = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setUploading(true);
        setForm((p) => ({ ...p, image: result.assets[0].uri }));
        setTimeout(() => setUploading(false), 500);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const hasChanges = () => {
    if (!currentTeacher) return false;
    return (
      form.name !== currentTeacher.name ||
      form.job !== currentTeacher.job ||
      form.location !== currentTeacher.location ||
      form.timework !== currentTeacher.timework ||
      form.school !== currentTeacher.school ||
      form.image !== currentTeacher.image
    );
  };

  const handleUpdate = async () => {
    if (!currentTeacher || !hasChanges()) return;
    try {
      await dispatch(
        updateTeacherAsync({ ...currentTeacher, ...form } as Teacher)
      ).unwrap();
      showNotification("Thành công", "Cập nhật thông tin thành công!");
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Cập nhật thất bại");
    }
  };

  const handleChangePassword = async () => {
    if (!currentTeacher) return;

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải ít nhất 6 ký tự!");
      return;
    }

    try {
      const updatedTeacher = {
        ...currentTeacher,
        password: newPassword,
      };

      await dispatch(updateTeacherAsync(updatedTeacher)).unwrap();

      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Đổi mật khẩu thất bại");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace("Login");
  };

  if (!currentTeacher) {
    return (
      <View style={styles.tabContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.tabTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.smallLogoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                form.image || "https://placehold.co/120x120/cccccc/999999/png",
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.avatarEditBtn}
            onPress={pickAvatar}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {[
        { label: "Tên", key: "name" },
        { label: "Công việc", key: "job" },
        { label: "Địa chỉ", key: "location" },
        { label: "Thời gian làm việc", key: "timework" },
        { label: "Trường", key: "school" },
      ].map(({ label, key }) => (
        <View key={key} style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{label}</Text>
          <TextInput
            style={styles.input}
            value={String(form[key as keyof Teacher] ?? "")}
            onChangeText={(t) => setForm((p) => ({ ...p, [key]: t }))}
          />
        </View>
      ))}

      <TouchableOpacity
        style={styles.compactButton}
        onPress={() => setShowChangePassword(true)}
      >
        <Ionicons
          name="key-outline"
          size={16}
          color="#fff"
          style={styles.buttonIcon}
        />
        <Text style={styles.compactButtonText}>Đổi mật khẩu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.compactButton,
          styles.updateButtonColor,
          !hasChanges() && styles.disabledButton,
        ]}
        onPress={handleUpdate}
        disabled={!hasChanges()}
      >
        <Ionicons
          name="save-outline"
          size={16}
          color="#fff"
          style={styles.buttonIcon}
        />
        <Text
          style={[
            styles.compactButtonText,
            !hasChanges() && styles.disabledButtonText,
          ]}
        >
          Cập nhật
        </Text>
      </TouchableOpacity>

      <Modal visible={showChangePassword} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nhập lại</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.confirmText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowChangePassword(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
const TeacherScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: { paddingBottom: 5, height: 60 },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Courses"
        component={CoursesTab}
        options={{
          tabBarLabel: "Khóa học",
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        options={{
          tabBarLabel: "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TeacherScreen;

const styles = StyleSheet.create({
  tabContainer: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tabTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#16a34a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  coursesList: { gap: 12 },
  noCoursesText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
    marginTop: 40,
  },
  loadingText: { marginTop: 12, color: "#6b7280", textAlign: "center" },

  headerContainer: { alignItems: "center", marginBottom: 24 },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  smallLogoutButton: {
    padding: 6,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },
  avatarContainer: {
    position: "relative",
    marginTop: 12,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#16a34a",
    elevation: 4,
  },
  avatar: { width: "100%", height: "100%" },
  avatarEditBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#16a34a",
    padding: 6,
    borderRadius: 20,
  },

  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  halfInput: { flex: 1 },
  textArea: { height: 80, textAlignVertical: "top" },
  pickerContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  pickerItemSelected: { backgroundColor: "#16a34a" },
  pickerText: { fontSize: 12, color: "#374151" },
  pickerTextSelected: { color: "#fff", fontWeight: "600" },

  compactButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    elevation: 1,
  },
  updateButtonColor: { backgroundColor: "#16a34a" },
  buttonIcon: { marginRight: 6 },
  compactButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  disabledButton: { backgroundColor: "#9ca3af" },
  disabledButtonText: { color: "#e5e7eb" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "92%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },
  modalImagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  uploadButtonText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  confirmButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmText: { color: "#fff", fontWeight: "600" },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: { color: "#374151", fontWeight: "600" },
});
