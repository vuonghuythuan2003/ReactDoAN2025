import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL_USER } from '../../api/index';

// Lấy thông tin tài khoản
export const fetchUserAccount = createAsyncThunk(
    'accountUser/fetchUserAccount',
    async (userId, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        if (!token) {
            return rejectWithValue('Không tìm thấy token, vui lòng đăng nhập lại');
        }
        try {
            const response = await BASE_URL_USER.get(`/account?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user account:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin tài khoản');
        }
    }
);

// Cập nhật thông tin tài khoản với multipart/form-data
export const updateUserAccount = createAsyncThunk(
    'accountUser/updateUserAccount',
    async ({ userId, data }, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        if (!token) {
            return rejectWithValue('Không tìm thấy token, vui lòng đăng nhập lại');
        }
        try {
            const response = await BASE_URL_USER.put(`/account?userId=${userId}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating user account:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật thông tin tài khoản');
        }
    }
);

// Đổi mật khẩu
export const changePassword = createAsyncThunk(
    'accountUser/changePassword',
    async ({ userId, data }, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        if (!token) {
            return rejectWithValue('Không tìm thấy token, vui lòng đăng nhập lại');
        }
        try {
            const response = await BASE_URL_USER.put(`/account/change-password?userId=${userId}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json', // Đổi mật khẩu dùng JSON
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error changing password:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
        }
    }
);

const accountUserSlice = createSlice({
    name: 'accountUser',
    initialState: {
        userAccount: null,
        loading: false,
        error: null,
        hasFetchedAccount: false,
    },
    reducers: {
        resetUserAccount: (state) => {
            state.userAccount = null;
            state.loading = false;
            state.error = null;
            state.hasFetchedAccount = false;
        },
    },
    extraReducers: (builder) => {
        // Fetch User Account
        builder
            .addCase(fetchUserAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserAccount.fulfilled, (state, action) => {
                state.loading = false;
                state.userAccount = action.payload;
                state.hasFetchedAccount = true;
            })
            .addCase(fetchUserAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update User Account
        builder
            .addCase(updateUserAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserAccount.fulfilled, (state, action) => {
                state.loading = false;
                state.userAccount = action.payload;
            })
            .addCase(updateUserAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Change Password
        builder
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetUserAccount } = accountUserSlice.actions;
export default accountUserSlice.reducer;