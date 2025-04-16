import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL_ADMIN, getToken } from '../../api/index';

// Lấy tất cả đơn hàng với phân trang
export const fetchAllOrders = createAsyncThunk('orders/fetchAllOrders', async ({ page, size }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.get(`/orders?page=${page}&size=${size}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;
    return {
      content: data.content || data,
      total: data.totalElements || 0,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể lấy danh sách đơn hàng!' });
  }
});

// Lấy đơn hàng theo trạng thái với phân trang
export const fetchOrdersByStatus = createAsyncThunk('orders/fetchOrdersByStatus', async ({ status, page, size }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.get(`/orders/status/${status}?page=${page}&size=${size}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;
    return {
      content: data.content || data,
      total: data.totalElements || 0,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: `Không thể lấy danh sách đơn hàng với trạng thái ${status}!` });
  }
});

// Lấy chi tiết đơn hàng
export const fetchOrderDetail = createAsyncThunk('orders/fetchOrderDetail', async (orderId, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.get(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      ...response.data,
      items: response.data.items || [],
      serialNumber: response.data.serialNumber || response.data.orderId, // Đảm bảo serialNumber luôn có giá trị
    };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể lấy chi tiết đơn hàng!' });
  }
});

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ orderId, status }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.put(
      `/orders/${orderId}/status`,
      status,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể cập nhật trạng thái đơn hàng!' });
  }
});

// Đặt trang hiện tại và kích thước trang
export const setCurrentPage = createAsyncThunk('orders/setCurrentPage', async (page) => page);
export const setPageSize = createAsyncThunk('orders/setPageSize', async (size) => size);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    totalOrders: 0,
    selectedOrder: null,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 5,
    searchText: '',
    statusFilter: null,
  },
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    setSearchText: (state, action) => {
      state.searchText = action.payload;
      let result = [...state.orders];
      if (action.payload) {
        const lowerSearchText = action.payload.toLowerCase();
        result = result.filter(
          (order) =>
            order.serialNumber.toLowerCase().includes(lowerSearchText) ||
            order.receiveName.toLowerCase().includes(lowerSearchText) ||
            order.receivePhone.toLowerCase().includes(lowerSearchText)
        );
      }
      state.orders = result;
      state.currentPage = 1;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Lấy tất cả đơn hàng
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.content;
        state.totalOrders = action.payload.total;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Lấy đơn hàng theo trạng thái
    builder
      .addCase(fetchOrdersByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.content;
        state.totalOrders = action.payload.total;
      })
      .addCase(fetchOrdersByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Lấy chi tiết đơn hàng
    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Cập nhật trạng thái đơn hàng
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        state.orders = state.orders.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order));
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Cài đặt phân trang
    builder
      .addCase(setCurrentPage.fulfilled, (state, action) => {
        state.currentPage = action.payload;
      })
      .addCase(setPageSize.fulfilled, (state, action) => {
        state.pageSize = action.payload;
      });
  },
});

export const { clearSelectedOrder, setSearchText, setStatusFilter } = orderSlice.actions;
export default orderSlice.reducer;