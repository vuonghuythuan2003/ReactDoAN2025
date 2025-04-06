import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../api/index';

// Gửi email khôi phục mật khẩu
export const forgotPassword = createAsyncThunk(
  'gmail/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await BASE_URL.post('/account/forgot-password', { email });
      return response.data; // "Email khôi phục mật khẩu đã được gửi..."
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đã xảy ra lỗi khi gửi yêu cầu khôi phục mật khẩu');
    }
  }
);

// Đặt lại mật khẩu
export const resetPassword = createAsyncThunk(
  'gmail/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await BASE_URL.post('/account/reset-password', { token, newPassword });
      return response.data; // "Mật khẩu đã được đặt lại thành công."
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
    }
  }
);

const gmailSlice = createSlice({
  name: 'gmail',
  initialState: {
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearGmailState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGmailState } = gmailSlice.actions;
export default gmailSlice.reducer;