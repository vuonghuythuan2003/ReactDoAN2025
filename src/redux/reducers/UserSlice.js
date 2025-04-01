import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Action bất đồng bộ để lấy tất cả người dùng
export const fetchUsers = createAsyncThunk('users/fetchUsers', async ({ page, size, sortBy, direction }, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/admin/users', {
      params: { page: page - 1, size, sortBy, direction },
    });
    const data = response.data.content || response.data;
    if (!Array.isArray(data)) throw new Error('Dữ liệu người dùng không phải mảng.');
    return { users: data, total: response.data.totalElements || data.length };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Không thể lấy danh sách người dùng!');
  }
});

// Action bất đồng bộ để lấy tất cả vai trò
export const fetchRoles = createAsyncThunk('users/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/admin/roles');
    const data = response.data;
    if (!Array.isArray(data)) throw new Error('Dữ liệu vai trò không phải mảng.');
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Không thể lấy danh sách vai trò!');
  }
});

// Action bất đồng bộ để thêm hoặc xóa vai trò
export const updateUserRoles = createAsyncThunk('users/updateUserRoles', async ({ userId, rolesToAdd, rolesToRemove }, { rejectWithValue }) => {
  try {
    for (const roleId of rolesToAdd) {
      await axios.put(`http://localhost:8080/api/v1/admin/users/${userId}/role/${roleId}`, {});
    }
    for (const roleId of rolesToRemove) {
      await axios.delete(`http://localhost:8080/api/v1/admin/users/${userId}/role/${roleId}`);
    }
    return { userId, rolesToAdd, rolesToRemove };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Không thể cập nhật quyền!');
  }
});

// Action bất đồng bộ để cập nhật trạng thái người dùng
export const toggleUserStatus = createAsyncThunk('users/toggleUserStatus', async ({ userId, status }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/v1/admin/users/${userId}`, {}, {
      params: { status },
    });
    return { userId, status: response.data.status || status };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái người dùng!');
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    totalUsers: 0,
    roles: [],
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 5,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    selectedUser: null,
    selectedRoles: [],
  },
  reducers: {
    setCurrentPage: (state, action) => { state.currentPage = action.payload; },
    setPageSize: (state, action) => { state.pageSize = action.payload; },
    setSort: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.sortDirection;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.selectedRoles = action.payload?.roles?.map(role => role.id) || [];
    },
    setSelectedRoles: (state, action) => { state.selectedRoles = action.payload; },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.selectedRoles = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Roles
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update User Roles
    builder
      .addCase(updateUserRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRoles.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Toggle User Status
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map(user =>
          user.id === action.payload.userId ? { ...user, status: action.payload.status } : user
        );
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentPage, setPageSize, setSort, setSelectedUser, setSelectedRoles, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;