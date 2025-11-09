import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../auth/store";
import { addCourseAsync, fetchCoursesAsync } from "../auth/dataSlice";
import { Course, Chapter, Lesson, Teacher, CATEGORIES } from "../types/type";
import { StyleSheet } from "react-native";

const STATUS_OPTIONS: Array<"completed" | "inprogress" | "not_started"> = [
  "not_started",
  "inprogress",
  "completed",
];

const CourseCreateScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.data.loading);
  const currentTeacher = useSelector(
    (state: RootState) => state.auth.currentUser as Teacher | null
  );

  const [course, setCourse] = useState<Partial<Course>>({
    name: "",
    price: 0,
    discount: 0,
    category: "",
    description: "",
    image: "",
    project: { description: "", studentproject: [] },
    lessoncount: 0,
    duration: "",
    chapters: [],
    qa: [],
    reviews: [],
    teacherid: currentTeacher?.id || 0,
    vote: 0,
    votecount: 0,
    likes: 0,
    share: 0,
  });

  const [chapters, setChapters] = useState<Chapter[]>([
    {
      title: "Chương 1",
      order: 1,
      lessons: [
        {
          id: Date.now(),
          title: "Bài học đầu tiên",
          duration: "15m",
          status: "not_started",
        },
      ],
    },
  ]);

  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    chapterIndex: number;
    lessonIndex: number;
  }>({ visible: false, chapterIndex: -1, lessonIndex: -1 });

  const totalLessons = Array.isArray(chapters)
    ? chapters.reduce(
        (s, ch) => s + (Array.isArray(ch.lessons) ? ch.lessons.length : 0),
        0
      )
    : 0;

  const totalMinutes = Array.isArray(chapters)
    ? chapters.reduce((s, ch) => {
        const lessons = Array.isArray(ch.lessons) ? ch.lessons : [];
        return (
          s +
          lessons.reduce((acc, l) => {
            const m =
              parseInt((l.duration || "").replace(/[^\d]/g, ""), 10) || 0;
            return acc + m;
          }, 0)
        );
      }, 0)
    : 0;

  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const durationStr =
    totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  const isValid = useCallback(() => {
    return (
      course.name &&
      course.price !== undefined &&
      course.price >= 0 &&
      course.discount !== undefined &&
      course.discount >= 0 &&
      course.category &&
      course.description &&
      course.image &&
      chapters.length > 0 &&
      chapters.every((ch) => ch.title && ch.lessons.length > 0) &&
      currentTeacher?.id
    );
  }, [course, chapters, currentTeacher]);

  const handleCreate = async () => {
    if (!currentTeacher?.id) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để tạo khóa học!");
      navigation.navigate("Login");
      return;
    }

    if (!isValid()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const cleanData: Omit<Course, "id" | "created_at"> = {
      name: course.name || "",
      price: course.price || 0,
      discount: course.discount || 0,
      category: course.category || "",
      description: course.description || "",
      image: course.image || "https://placehold.co/300x200/cccccc/999999/png",
      lessoncount: totalLessons,
      duration: durationStr,
      chapters: chapters.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((l) => ({
          ...l,
          id: l.id || Date.now(),
        })),
      })),
      project: {
        description: course.project?.description || "",
        studentproject: [],
      },
      qa: [],
      reviews: [],
      teacherid: currentTeacher.id,
      vote: 0,
      votecount: 0,
      likes: 0,
      share: 0,
    };

    // XÓA id HOÀN TOÀN (phòng trường hợp bị nhiễm)
    delete (cleanData as any).id;
    delete (cleanData as any).created_at;

    console.log(
      "Payload sent to Supabase (NO ID):",
      JSON.stringify(cleanData, null, 2)
    );

    try {
      const result = await dispatch(addCourseAsync(cleanData)).unwrap();
      console.log("Course created:", result);
      await dispatch(fetchCoursesAsync()).unwrap();
      Alert.alert("Thành công", "Tạo khóa học thành công!");
      navigation.goBack();
    } catch (err: any) {
      console.error("Supabase error:", JSON.stringify(err, null, 2));
      Alert.alert("Lỗi", err.message || "Tạo khóa học thất bại");
    }
  };

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        title: `Chương ${prev.length + 1}`,
        order: prev.length + 1,
        lessons: [
          {
            id: Date.now(),
            title: "Bài học đầu tiên",
            duration: "15m",
            status: "not_started",
          },
        ],
      },
    ]);
  };

  const removeChapter = (idx: number) => {
    if (chapters.length <= 1) {
      Alert.alert("Cảnh báo", "Phải có ít nhất 1 chương!");
      return;
    }
    setChapters((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateChapter = (idx: number, field: keyof Chapter, val: any) => {
    setChapters((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const addLesson = (chIdx: number) => {
    setChapters((prev) => {
      const copy = [...prev];
      const maxId = Math.max(
        ...copy.flatMap((c) => c.lessons.map((l) => l.id || 0)),
        0
      );
      copy[chIdx].lessons.push({
        id: maxId + 1,
        title: "Bài học mới",
        duration: "10m",
        status: "not_started",
      });
      return copy;
    });
  };

  const updateLesson = (
    chIdx: number,
    lesIdx: number,
    field: keyof Lesson,
    val: any
  ) => {
    setChapters((prev) => {
      const copy = [...prev];
      copy[chIdx].lessons[lesIdx] = {
        ...copy[chIdx].lessons[lesIdx],
        [field]: val,
      };
      return copy;
    });
  };

  const removeLesson = (chIdx: number, lesIdx: number) => {
    setChapters((prev) => {
      const copy = [...prev];
      copy[chIdx].lessons.splice(lesIdx, 1);
      return copy;
    });
  };

  const openStatusModal = (chIdx: number, lesIdx: number) => {
    setStatusModal({ visible: true, chapterIndex: chIdx, lessonIndex: lesIdx });
  };

  const closeStatusModal = () => {
    setStatusModal({ visible: false, chapterIndex: -1, lessonIndex: -1 });
  };

  const selectStatus = (status: "completed" | "inprogress" | "not_started") => {
    const { chapterIndex, lessonIndex } = statusModal;
    if (chapterIndex >= 0 && lessonIndex >= 0) {
      updateLesson(chapterIndex, lessonIndex, "status", status);
    }
    closeStatusModal();
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên khóa học</Text>
          <TextInput
            style={styles.input}
            value={course.name}
            onChangeText={(t) => setCourse({ ...course, name: t })}
            placeholder="Nhập tên khóa học"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Giá (₫)</Text>
            <TextInput
              style={styles.input}
              value={course.price?.toString() || ""}
              onChangeText={(t) =>
                setCourse({ ...course, price: Number(t) || 0 })
              }
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Giảm giá (%)</Text>
            <TextInput
              style={styles.input}
              value={course.discount?.toString() || ""}
              onChangeText={(t) =>
                setCourse({ ...course, discount: Number(t) || 0 })
              }
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Danh mục</Text>
          <View style={styles.pickerContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.pickerItem,
                  course.category === cat && styles.pickerItemSelected,
                ]}
                onPress={() => setCourse({ ...course, category: cat })}
              >
                <Text
                  style={[
                    styles.pickerText,
                    course.category === cat && styles.pickerTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Số bài học</Text>
            <Text style={[styles.input, styles.readOnly]}>{totalLessons}</Text>
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Thời lượng</Text>
            <Text style={[styles.input, styles.readOnly]}>{durationStr}</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mô tả khóa học</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={course.description}
            onChangeText={(t) => setCourse({ ...course, description: t })}
            multiline
            placeholder="Nhập mô tả khóa học"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mô tả dự án</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={course.project?.description}
            onChangeText={(t) =>
              setCourse({
                ...course,
                project: {
                  description: t,
                  studentproject: course.project?.studentproject || [],
                },
              })
            }
            multiline
            placeholder="Nhập mô tả dự án"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Link ảnh</Text>
          <TextInput
            style={styles.input}
            value={course.image}
            onChangeText={(t) => setCourse({ ...course, image: t })}
            placeholder="Nhập link ảnh"
          />
          {course.image ? (
            <Image
              source={{
                uri:
                  course.image ||
                  "https://placehold.co/300x200/cccccc/999999/png",
              }}
              style={styles.imagePreview}
              resizeMode="cover"
              onError={() => {
                Alert.alert("Lỗi", "Không thể tải ảnh. Vui lòng kiểm tra URL.");
                setCourse({ ...course, image: "" });
              }}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Không có ảnh</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nội dung khóa học</Text>
            <TouchableOpacity style={styles.addChapterBtn} onPress={addChapter}>
              <Ionicons name="add-circle" size={20} color="#16a34a" />
              <Text style={styles.addChapterText}>Thêm chương</Text>
            </TouchableOpacity>
          </View>

          {Array.isArray(chapters) &&
            chapters.map((chapter, chIdx) => (
              <View key={chapter.order ?? chIdx} style={styles.chapterBox}>
                <View style={styles.chapterHeader}>
                  <TextInput
                    style={styles.chapterTitleInput}
                    value={chapter.title}
                    onChangeText={(t) => updateChapter(chIdx, "title", t)}
                    placeholder="Nhập tiêu đề chương"
                  />
                  <TouchableOpacity
                    style={styles.removeChapterBtn}
                    onPress={() => removeChapter(chIdx)}
                  >
                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {(chapter.lessons ?? []).map((lesson, lesIdx) => (
                  <View key={lesson.id ?? lesIdx} style={styles.lessonRow}>
                    <TextInput
                      style={styles.lessonTitleInput}
                      value={lesson.title}
                      onChangeText={(t) =>
                        updateLesson(chIdx, lesIdx, "title", t)
                      }
                      placeholder="Nhập tiêu đề bài học"
                    />
                    <TextInput
                      style={styles.durationInput}
                      value={lesson.duration}
                      onChangeText={(t) =>
                        updateLesson(chIdx, lesIdx, "duration", t)
                      }
                      placeholder="10m"
                    />
                    <TouchableOpacity
                      style={styles.statusBtn}
                      onPress={() => openStatusModal(chIdx, lesIdx)}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          lesson.status === "completed" &&
                            styles.statusCompleted,
                          lesson.status === "inprogress" &&
                            styles.statusInprogress,
                          lesson.status === "not_started" &&
                            styles.statusNotStarted,
                        ]}
                      >
                        {lesson.status === "completed"
                          ? "Hoàn thành"
                          : lesson.status === "inprogress"
                          ? "Đang học"
                          : "Chưa học"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeLesson(chIdx, lesIdx)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addLessonBtn}
                  onPress={() => addLesson(chIdx)}
                >
                  <Ionicons name="add" size={16} color="#16a34a" />
                  <Text style={styles.addLessonText}>Thêm bài học</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.updateButton,
              (!isValid() || loading) && styles.disabledButton,
            ]}
            onPress={handleCreate}
            disabled={!isValid() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateText}>Tạo khóa học</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={statusModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn trạng thái</Text>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.statusOption}
                onPress={() => selectStatus(status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    status === "completed" && styles.statusCompleted,
                    status === "inprogress" && styles.statusInprogress,
                    status === "not_started" && styles.statusNotStarted,
                  ]}
                >
                  {status === "completed"
                    ? "Hoàn thành"
                    : status === "inprogress"
                    ? "Đang học"
                    : "Chưa học"}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={closeStatusModal}
            >
              <Text style={styles.modalCloseText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default CourseCreateScreen;

// Styles giữ nguyên
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  form: { padding: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  readOnly: { backgroundColor: "#f3f4f6", color: "#6b7280" },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  half: { flex: 1 },
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
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  imagePlaceholderText: { color: "#6b7280", fontSize: 14 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  addChapterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addChapterText: {
    color: "#16a34a",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 13,
  },
  chapterBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eecz5e7eb",
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chapterTitleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  removeChapterBtn: { padding: 4 },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  lessonTitleInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  durationInput: {
    width: 60,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 14,
  },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  statusCompleted: { color: "#16a34a" },
  statusInprogress: { color: "#f59e0b" },
  statusNotStarted: { color: "#6b7280" },
  removeBtn: { padding: 4 },
  addLessonBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addLessonText: { color: "#16a34a", fontSize: 13, marginLeft: 4 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  updateButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  disabledButton: { backgroundColor: "#9ca3af" },
  updateText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  statusOption: {
    padding: 12,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  statusOptionText: { fontSize: 16, fontWeight: "600" },
  modalClose: { marginTop: 16 },
  modalCloseText: { color: "#ef4444", fontWeight: "600" },
});
