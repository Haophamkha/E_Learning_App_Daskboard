import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "./supabaseClient";
import { Teacher, Course } from "../types/type";
import { RootState } from "./store";

interface DataState {
  teachers: Teacher[];
  courses: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  teachers: [],
  courses: [],
  loading: false,
  error: null,
};

export const fetchAppData = createAsyncThunk(
  "data/fetchAppData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("id");
      if (error) {
        console.error(
          "Supabase fetch teachers error:",
          JSON.stringify(error, null, 2)
        );
        throw new Error(error.message);
      }
      return data as Teacher[];
    } catch (err: any) {
      console.error("Unexpected fetch error:", JSON.stringify(err, null, 2));
      return rejectWithValue(err.message || "Failed to fetch teachers");
    }
  }
);


export const fetchCoursesAsync = createAsyncThunk(
  "data/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("id");
      if (error) {
        console.error(
          "Supabase fetch courses error:",
          JSON.stringify(error, null, 2)
        );
        throw new Error(error.message);
      }
      return data as Course[];
    } catch (err: any) {
      console.error("Unexpected fetch error:", JSON.stringify(err, null, 2));
      return rejectWithValue(err.message || "Failed to fetch courses");
    }
  }
);

export const addTeacherAsync = createAsyncThunk(
  "data/addTeacher",
  async (teacher: Omit<Teacher, "id">, { rejectWithValue }) => {
    try {
      console.log(
        "Adding teacher to Supabase:",
        JSON.stringify(teacher, null, 2)
      );
      const { data, error } = await supabase
        .from("teachers")
        .insert(teacher)
        .select()
        .single();

      if (error) {
        console.error(
          "Supabase insert teacher error:",
          JSON.stringify(error, null, 2)
        );
        throw error;
      }
      console.log("Teacher inserted successfully:", data);
      return data as Teacher;
    } catch (err: any) {
      console.error("Unexpected error:", JSON.stringify(err, null, 2));
      return rejectWithValue(err.message || "Không thể thêm teacher");
    }
  }
);

export const updateTeacherAsync = createAsyncThunk(
  "data/updateTeacherAsync",
  async (teacher: Teacher, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .update({
          name: teacher.name,
          job: teacher.job,
          location: teacher.location,
          timework: teacher.timework,
          image: teacher.image,
          school: teacher.school,
          username: teacher.username,
          password: teacher.password,
          status: teacher.status,
        })
        .eq("id", teacher.id)
        .select()
        .single();

      if (error) {
        console.error(
          "Supabase update teacher error:",
          JSON.stringify(error, null, 2)
        );
        throw new Error(error.message);
      }
      return data as Teacher;
    } catch (err: any) {
      console.error("Unexpected error:", JSON.stringify(err, null, 2));
      return rejectWithValue(err.message || "Không thể cập nhật teacher");
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  "data/deleteTeacher",
  async (id: number, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) {
        console.error(
          "Supabase delete teacher error:",
          JSON.stringify(error, null, 2)
        );
        throw new Error(error.message);
      }
      return id;
    } catch (err: any) {
      console.error("Unexpected error:", JSON.stringify(err, null, 2));
      return rejectWithValue(err.message || "Không thể xóa teacher");
    }
  }
);

export const addCourseAsync = createAsyncThunk(
  "data/addCourse",
  async (
    course: Omit<Course, "id" | "created_at">,
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const currentTeacher = state.auth.currentUser as Teacher | null;

      if (!currentTeacher?.id) {
        return rejectWithValue("Thông tin giáo viên không tồn tại");
      }

      // TẠO PAYLOAD SẠCH – KHÔNG DÙNG course TRỰC TIẾP
      const payload = {
        name: course.name,
        price: course.price,
        discount: course.discount,
        category: course.category,
        description: course.description,
        image: course.image,
        lessoncount: course.lessoncount,
        duration: course.duration,
        chapters: JSON.stringify(course.chapters || []),
        project: JSON.stringify(
          course.project || { description: "", studentproject: [] }
        ),
        qa: JSON.stringify(course.qa || []),
        reviews: JSON.stringify(course.reviews || []),
        teacherid: currentTeacher.id,
        vote: course.vote ?? 0,
        votecount: course.votecount ?? 0,
        likes: course.likes ?? 0,
        share: course.share ?? 0,
      };

      // XÓA id HOÀN TOÀN (phòng thủ)
      delete (payload as any).id;
      delete (payload as any).created_at;

      console.log("FINAL PAYLOAD (NO ID):", JSON.stringify(payload, null, 2));

      const { data, error } = await supabase
        .from("courses")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error(
          "Supabase insert course error:",
          JSON.stringify(error, null, 2)
        );
        throw error;
      }

      console.log("Course inserted successfully:", data);
      return data as Course;
    } catch (err: any) {
      console.error("Unexpected error:", JSON.stringify(err, null, 2));
      return rejectWithValue(err.message || "Không thể thêm khóa học");
    }
  }
);

export const updateCourseAsync = createAsyncThunk(
  "data/updateCourseAsync",
  async (course: Course, { rejectWithValue }) => {
    try {
      console.log("Sending to Supabase:", {
        id: course.id,
        name: course.name,
        chapters: course.chapters,
        project: course.project,
      });

      const { data, error } = await supabase
        .from("courses")
        .update({
          name: course.name,
          price: course.price,
          discount: course.discount,
          category: course.category,
          duration: course.duration,
          description: course.description,
          project: JSON.stringify(course.project),
          image: course.image,
          lessoncount: course.lessoncount,
          chapters: JSON.stringify(course.chapters || []),
          qa: JSON.stringify(course.qa || []),
          reviews: JSON.stringify(course.reviews || []),
        })
        .eq("id", course.id)
        .select()
        .single();

      if (error) {
        console.error(
          "Supabase update course error:",
          JSON.stringify(error, null, 2)
        );
        throw new Error(error.message);
      }

      console.log("Course updated successfully:", data);
      return data as Course;
    } catch (err: any) {
      console.error("Unexpected error:", JSON.stringify(err, null, 2));
      return rejectWithValue(err.message || "Không thể cập nhật khóa học");
    }
  }
);

export const deleteCourseAsync = createAsyncThunk(
  "data/deleteCourse",
  async (id: number, { rejectWithValue }) => {
    try {
      console.log("Deleting course ID:", id);
      const { error } = await supabase.from("courses").delete().eq("id", id);
      console.log("Delete result:", error);


      if (error) {
        console.error(
          "Supabase delete course error:",
          JSON.stringify(error, null, 2)
        );
        return rejectWithValue(error.message || "Xóa thất bại");
      }

      console.log("Course deleted successfully");
      return id;
    } catch (err: any) {
      console.error("Unexpected error:", JSON.stringify(err, null, 2));
      return rejectWithValue(err.message || "Lỗi không xác định");
    }
  }
);

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppData.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchAppData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Không thể lấy danh sách teacher";
      })

      .addCase(fetchCoursesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCoursesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Không thể lấy danh sách khóa học";
      })

      .addCase(addTeacherAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeacherAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers.push(action.payload);
      })
      .addCase(addTeacherAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Không thể thêm teacher";
      })

      .addCase(updateTeacherAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeacherAsync.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.teachers.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.teachers[idx] = action.payload;
      })
      .addCase(updateTeacherAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Không thể cập nhật teacher";
      })

      .addCase(deleteTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteTeacher.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.teachers = state.teachers.filter(
            (t) => t.id !== action.payload
          );
        }
      )
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Không thể xóa teacher";
      })

      // ADD COURSE
      .addCase(addCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload);
      })
      .addCase(addCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Không thể thêm khóa học";
      })

      .addCase(updateCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.courses.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.courses[idx] = action.payload;
      })
      .addCase(updateCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Không thể cập nhật khóa học";
      })

      .addCase(deleteCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteCourseAsync.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.courses = state.courses.filter((c) => c.id !== action.payload);
        }
      )
      .addCase(deleteCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Không thể xóa khóa học";
      });
  },
});

export default dataSlice.reducer;
