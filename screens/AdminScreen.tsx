import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  LayoutChangeEvent,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../auth/store";
import { Teacher, Admin } from "../types/type";
import {
  fetchAppData,
  updateTeacherAsync,
  deleteTeacher,
  addTeacherAsync,
} from "../auth/dataSlice";
import { logout } from "../auth/authSlice";
import { TeacherRow } from "../components/TeacherRow";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";


const AdminScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { teachers, loading, error } = useSelector(
    (state: RootState) => state.data
  );
  const currentAdmin = useSelector(
    (state: RootState) => state.auth.currentUser as Admin | null
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Teacher> | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterField, setFilterField] = useState<keyof Teacher | "">("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTeacher, setNewTeacher] = useState<Omit<Teacher, "id">>({
    name: "",
    job: "",
    username: "",
    password: "",
    location: "",
    timework: "",
    school: "",
    status: "active",
    image: "",
  });

  const pageSize = 8;

  const statusButtonRef = useRef<View>(null);
  const filterButtonRef = useRef<View>(null);
  const [statusPos, setStatusPos] = useState({ x: 0, y: 0, width: 120 });
  const [filterPos, setFilterPos] = useState({ x: 0, y: 0, width: 120 });

  const measureButton =
    (
      ref: React.RefObject<View | null>,
      setter: React.Dispatch<
        React.SetStateAction<{ x: number; y: number; width: number }>
      >
    ) =>
    (event: LayoutChangeEvent) => {
      ref.current?.measureInWindow((x, y, w, h) => {
        setter({ x, y: y + h + 4, width: w });
      });
    };

  useEffect(() => {
    dispatch(fetchAppData());
  }, [dispatch]);

  // Filter
  const filteredTeachers = teachers
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .filter((t) => {
      if (!searchText) return true;
      if (filterField && t[filterField]) {
        return String(t[filterField])
          .toLowerCase()
          .includes(searchText.toLowerCase());
      }
      return (
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (t.username?.toLowerCase() ?? "").includes(searchText.toLowerCase())
      );
    });

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));
  const pageData = filteredTeachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // add teacher
  const addTeacher = async () => {
    console.log("Adding teacher:", newTeacher);

    if (!newTeacher.name || !newTeacher.username || !newTeacher.password) {
      Alert.alert("Lỗi", "Vui lòng nhập Tên, Username và Password!");
      return;
    }

    if (
      !newTeacher.timework ||
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTeacher.timework)
    ) {
      Alert.alert(
        "Lỗi",
        "Thời gian làm việc phải đúng định dạng HH:MM (ví dụ: 08:30)"
      );
      return;
    }

    try {
      await dispatch(addTeacherAsync(newTeacher)).unwrap();
      Alert.alert("Thành công", "Đã thêm teacher mới!");
      setShowAddModal(false);
      resetNewTeacher();
      dispatch(fetchAppData());
    } catch (err: any) {
      console.error("Add teacher error:", err);
      Alert.alert("Lỗi", err.message || "Không thể thêm teacher");
    }
  };

  const resetNewTeacher = () => {
    setNewTeacher({
      name: "",
      job: "",
      username: "",
      password: "",
      location: "",
      timework: "",
      school: "",
      status: "active",
      image: "",
    });
  };

  // Edit / Delete / Status 
  const startEdit = (t: Teacher) => {
    setEditingId(t.id);
    setEditForm({ ...t });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };
  const updateEditField = (field: keyof Teacher, value: any) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };
  const saveEdit = async () => {
    if (!editForm || !editingId) return;
    try {
      await dispatch(updateTeacherAsync(editForm as Teacher)).unwrap();
      Alert.alert("Thành công", "Cập nhật thành công");
      dispatch(fetchAppData());
    } catch {
      Alert.alert("Lỗi", "Cập nhật thất bại");
    } finally {
      cancelEdit();
    }
  };
  const updateStatus = async (id: number, status: "active" | "inactive") => {
    const teacher = teachers.find((t) => t.id === id);
    if (!teacher) return;
    await dispatch(updateTeacherAsync({ ...teacher, status })).unwrap();
    dispatch(fetchAppData());
  };
  const onDeletePress = (t: Teacher) => {
    setSelectedTeacher(t);
    setDeleteConfirmVisible(true);
  };
  const onConfirmDelete = async () => {
    if (!selectedTeacher) return;
    await dispatch(deleteTeacher(selectedTeacher.id)).unwrap();
    Alert.alert("Đã xóa", "Teacher đã được xóa");
    dispatch(fetchAppData());
    setDeleteConfirmVisible(false);
  };
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const handleLogout = () => {
    dispatch(logout());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };

  const columnWidths: Partial<Record<keyof Teacher | "actions", number>> = {
    id: 60,
    image: 80,
    name: 150,
    job: 120,
    username: 140,
    password: 120,
    location: 140,
    timework: 120,
    school: 140,
    status: 100,
    actions: 160,
  };

  return (
    <View style={styles.container}>
      {/* admin */}
      <View style={styles.adminHeader}>
        {currentAdmin ? (
          <>
            <Image
              source={{
                uri: currentAdmin.image || "https://via.placeholder.com/60",
              }}
              style={styles.adminAvatar}
            />
            <View style={styles.adminInfo}>
              <Text style={styles.adminName}>{currentAdmin.name}</Text>
              <Text style={styles.adminId}>ID: {currentAdmin.id}</Text>
              <Text style={styles.adminContact}>{currentAdmin.contact}</Text>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={{ color: "#6b7280" }}>Đang tải admin...</Text>
        )}
      </View>

      {/*TOOLBAR*/}
      <View style={styles.toolbarContainer}>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowAddModal(true)}
          >
            <FontAwesome
              name="plus"
              size={12}
              color="#4b5563"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.filterText}>Thêm Teacher</Text>
          </TouchableOpacity>

          <View
            ref={statusButtonRef}
            onLayout={measureButton(statusButtonRef, setStatusPos)}
          >
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowFilterDropdown(false);
              }}
            >
              <Text style={styles.filterText}>
                Status: {statusFilter === "all" ? "All" : statusFilter}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            ref={filterButtonRef}
            onLayout={measureButton(filterButtonRef, setFilterPos)}
          >
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowStatusDropdown(false);
              }}
            >
              <FontAwesome
                name="filter"
                size={12}
                color="#4b5563"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.filterText}>
                {filterField ? `Filter: ${filterField}` : "Filter"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <FontAwesome
              name="search"
              size={12}
              color="#9ca3af"
              style={{ marginRight: 6 }}
            />
            <TextInput
              placeholder="Search..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      </View>

      {showStatusDropdown && (
        <View
          style={[
            styles.dropdown,
            { left: statusPos.x, top: statusPos.y, width: statusPos.width },
          ]}
        >
          {["all", "active", "inactive"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => {
                setStatusFilter(s as any);
                setShowStatusDropdown(false);
              }}
              style={styles.dropdownItemTouch}
            >
              <Text style={styles.dropdownItem}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showFilterDropdown && (
        <View
          style={[
            styles.dropdown,
            {
              left: filterPos.x,
              top: filterPos.y,
              width: filterPos.width + 30,
            },
          ]}
        >
          {["name", "job", "location", "timework", "school"].map((field) => (
            <TouchableOpacity
              key={field}
              onPress={() => {
                setFilterField(field as keyof Teacher);
                setShowFilterDropdown(false);
              }}
              style={styles.dropdownItemTouch}
            >
              <Text style={styles.dropdownItem}>{field}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* table*/}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#16a34a"
            style={{ marginTop: 50 }}
          />
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        ) : (
          <>
            <ScrollView horizontal style={{ flex: 1 }}>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  {Object.keys(columnWidths).map((key) => (
                    <Text
                      key={key}
                      style={[
                        styles.tableCell,
                        {
                          width: columnWidths[key as keyof typeof columnWidths],
                        },
                      ]}
                    >
                      {key.toUpperCase()}
                    </Text>
                  ))}
                </View>
                {pageData.map((item, index) => (
                  <TeacherRow
                    key={item.id}
                    item={item}
                    stt={(currentPage - 1) * pageSize + index + 1} // Tính STT đúng theo trang
                    isEditing={editingId === item.id}
                    editForm={editForm}
                    onEditField={updateEditField}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onDeletePress={onDeletePress}
                    onStatusChange={updateStatus}
                    columnWidths={columnWidths}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={goPrev}
                disabled={currentPage === 1}
                style={[
                  styles.pageNav,
                  currentPage === 1 && styles.disabledButton,
                ]}
              >
                <FontAwesome
                  name="arrow-left"
                  size={12}
                  color={currentPage === 1 ? "#9ca3af" : "#374151"}
                />
                <Text
                  style={[
                    styles.pageNavText,
                    currentPage === 1 && styles.disabledText,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <View style={styles.pageNumbers}>
                {Array.from(
                  { length: Math.min(3, totalPages) },
                  (_, i) => i + 1
                ).map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setCurrentPage(num)}
                    style={[
                      styles.pageNumber,
                      currentPage === num && styles.activePage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pageNumberText,
                        currentPage === num && styles.activePageText,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
                {totalPages > 3 && (
                  <>
                    <Text style={{ color: "#6b7280" }}>...</Text>
                    <TouchableOpacity
                      onPress={() => setCurrentPage(totalPages)}
                      style={[
                        styles.pageNumber,
                        currentPage === totalPages && styles.activePage,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pageNumberText,
                          currentPage === totalPages && styles.activePageText,
                        ]}
                      >
                        {totalPages}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <TouchableOpacity
                onPress={goNext}
                disabled={currentPage === totalPages}
                style={[
                  styles.pageNav,
                  currentPage === totalPages && styles.disabledButton,
                ]}
              >
                <Text
                  style={[
                    styles.pageNavText,
                    currentPage === totalPages && styles.disabledText,
                  ]}
                >
                  Next
                </Text>
                <FontAwesome
                  name="arrow-right"
                  size={12}
                  color={currentPage === totalPages ? "#9ca3af" : "#374151"}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Thêm Teacher Mới</Text>
            <ScrollView style={{ maxHeight: 520 }}>
              {[
                { key: "name", label: "Tên" },
                { key: "job", label: "Công việc" },
                { key: "username", label: "Tên đăng nhập" },
                { key: "password", label: "Mật khẩu", secure: true },
                { key: "location", label: "Địa chỉ" },
                { key: "school", label: "Trường" },
              ].map(({ key, label, secure }) => (
                <View key={key} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{label}</Text>
                  <TextInput
                    placeholder={label}
                    value={(newTeacher as any)[key]}
                    onChangeText={(v) =>
                      setNewTeacher((p) => ({ ...p, [key]: v }))
                    }
                    style={styles.modalInput}
                    secureTextEntry={secure}
                    autoCapitalize={key === "username" ? "none" : "sentences"}
                  />
                </View>
              ))}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Thời gian làm việc (HH:MM)
                </Text>
                <TextInput
                  placeholder="08:30"
                  value={newTeacher.timework}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9:]/g, "").slice(0, 5);
                    if (cleaned.length === 2 && !cleaned.includes(":")) {
                      setNewTeacher((p) => ({ ...p, timework: cleaned + ":" }));
                    } else {
                      setNewTeacher((p) => ({ ...p, timework: cleaned }));
                    }
                  }}
                  style={[
                    styles.modalInput,
                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                      newTeacher.timework
                    ) &&
                      newTeacher.timework !== "" && { borderColor: "#ef4444" },
                  ]}
                  keyboardType="numeric"
                  maxLength={5}
                />
                {newTeacher.timework !== "" &&
                  !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                    newTeacher.timework
                  ) && (
                    <Text
                      style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}
                    >
                      Sai định dạng! Ví dụ: 08:30
                    </Text>
                  )}
              </View>

              {/* iamge pre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Link ảnh (URL)</Text>
                <TextInput
                  placeholder="https://example.com/avatar.jpg"
                  value={newTeacher.image}
                  onChangeText={(v) =>
                    setNewTeacher((p) => ({ ...p, image: v }))
                  }
                  style={styles.modalInput}
                  autoCapitalize="none"
                />
              </View>

              {newTeacher.image ? (
                <View style={{ alignItems: "center", marginTop: 12 }}>
                  <Image
                    source={{ uri: newTeacher.image }}
                    style={{ width: 120, height: 120, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <Text
                    style={{ marginTop: 8, color: "#16a34a", fontSize: 12 }}
                  >
                    Preview ảnh
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.addButton} onPress={addTeacher}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Thêm Teacher
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetNewTeacher();
                }}
              >
                <Text style={{ color: "#374151", fontWeight: "bold" }}>
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDeleteModal
        visible={deleteConfirmVisible}
        onConfirm={onConfirmDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
      />
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16 },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  adminAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  adminInfo: { flex: 1 },
  adminName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  adminId: { fontSize: 13, color: "#6b7280" },
  adminContact: { fontSize: 13, color: "#6b7280" },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  toolbarContainer: { marginBottom: 16, zIndex: 10 },
  actionGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: { color: "#374151", fontSize: 13, fontWeight: "600" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    flex: 1,
    maxWidth: 220,
  },
  searchInput: { flex: 1, fontSize: 13, color: "#374151", paddingVertical: 0 },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 30,
    zIndex: 99999,
  },
  dropdownItemTouch: { paddingVertical: 10, paddingHorizontal: 14 },
  dropdownItem: { fontSize: 13, color: "#374151" },
  content: { flex: 1 },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableHeader: { backgroundColor: "#f9fafb" },
  tableCell: { padding: 12, fontSize: 13, fontWeight: "500", color: "#374151" },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  pageNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  pageNavText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  disabledButton: { opacity: 0.5 },
  disabledText: { color: "#9ca3af" },
  pageNumbers: { flexDirection: "row", gap: 8 },
  pageNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  activePage: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  pageNumberText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  activePageText: { color: "#fff" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  inputGroup: { marginBottom: 12 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  addButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
