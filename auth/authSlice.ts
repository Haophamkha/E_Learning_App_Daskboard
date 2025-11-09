import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "./supabaseClient";
import { Admin, Teacher } from "../types/type";

export type AuthUser = Admin | Teacher;

export interface AuthState {
  currentUser: AuthUser | null;
  loading: boolean;
  error: string | null;
  userType: "admin" | "teacher" | null;
}

const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: null,
  userType: null,
};

export const login = createAsyncThunk<
  { user: AuthUser; type: "admin" | "teacher" },
  { username: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ username, password }, { rejectWithValue }) => {
  try {

    const { data: adminData, error: adminErr } = await supabase
      .from("admins")
      .select("*")
      .eq("adminname", username)
      .eq("password", password)
      .single();

    if (adminErr && adminErr.code !== "PGRST116") {
      console.error("Admin fetch error:", adminErr);
      throw adminErr;
    }

    if (adminData) {
      return { user: adminData as Admin, type: "admin" };
    }

    const { data: teacherData, error: teacherErr } = await supabase
      .from("teachers")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (teacherErr && teacherErr.code !== "PGRST116") {
      console.error("Teacher fetch error:", teacherErr);
      throw teacherErr;
    }

    if (teacherData) {
      if (
        teacherData.status &&
        teacherData.status.toLowerCase() === "inactive"
      ) {
        return rejectWithValue("Tài khoản của bạn hiện đang bị khóa");
      }

      return { user: teacherData as Teacher, type: "teacher" };
    }

    return rejectWithValue("Tên đăng nhập hoặc mật khẩu không đúng");
  } catch (err: any) {
    console.error("Login error:", err);
    return rejectWithValue(err.message || "Đăng nhập thất bại");
  }
});


export const logout = createAsyncThunk<boolean, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      return true;
    } catch (err: any) {
      console.error("Unexpected logout error:", err);
      return rejectWithValue(err.message || "Đăng xuất thất bại");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateCurrentUser: (state, action: PayloadAction<AuthUser>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (
          state,
          action: PayloadAction<{ user: AuthUser; type: "admin" | "teacher" }>
        ) => {
          state.loading = false;
          state.currentUser = action.payload.user;
          state.userType = action.payload.type;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đăng nhập thất bại";
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        state.userType = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload || "Đăng xuất thất bại";
      });
  },
});

export const { updateCurrentUser } = authSlice.actions;
export default authSlice.reducer;
