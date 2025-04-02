import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, logout } from '../../services/authService.js';
import { getToken, getRoles, setRoles, removeRoles } from '../../api/index.jsx';

export const loginUser = createAsyncThunk('auth/loginUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await login(username, password);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Đăng nhập thất bại' });
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await register(userData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Đăng ký thất bại' });
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await logout();
    return;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Đăng xuất thất bại' });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: getToken() || null,
    roles: getRoles(),
    isAuthenticated: !!getToken(),
    loading: false,
    error: null,
    validationErrors: {}, // Thêm để lưu lỗi validate từ backend
  },
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.roles = [];
      state.isAuthenticated = false;
      state.error = null;
      state.validationErrors = {};
      removeRoles();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.user = { username: action.payload.username };
        state.roles = action.payload.roles.map((role) => role.roleName || role);
        setRoles(state.roles);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload.errors) {
          state.validationErrors = action.payload.errors; // Lưu lỗi validate
          state.error = action.payload.message || 'Đăng nhập thất bại';
        } else {
          state.error = action.payload.message || 'Đăng nhập thất bại';
          state.validationErrors = {};
        }
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Đăng ký thất bại';
        state.validationErrors = action.payload.errors || {};
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.error = null;
        state.validationErrors = {};
        removeRoles();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Đăng xuất thất bại';
        state.validationErrors = {};
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;