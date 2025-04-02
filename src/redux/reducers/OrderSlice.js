import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL_ADMIN, getToken } from '../../api/index'; // Import BASE_URL_ADMIN và getToken

// Action bất đồng bộ để lấy tất cả đơn hàng
export const fetchAllOrders = createAsyncThunk('orders/fetchAllOrders', async (_, { rejectWithValue }) => {
  try {
    const token = getToken(); // Lấy token từ cookies
    const response = await BASE_URL_ADMIN.get('/orders', {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào header
      },
    });
    return response.data.content || response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể lấy danh sách đơn hàng!' });
  }
});

// Action bất đồng bộ để lấy đơn hàng theo trạng thái
export const fetchOrdersByStatus = createAsyncThunk('orders/fetchOrdersByStatus', async (status, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.get(`/orders/status/${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.content || response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: `Không thể lấy danh sách đơn hàng với trạng thái ${status}!` });
  }
});

// Action bất đồng bộ để lấy chi tiết đơn hàng
export const fetchOrderDetail = createAsyncThunk('orders/fetchOrderDetail', async (orderId, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.get(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể lấy chi tiết đơn hàng!' });
  }
});

// Action bất đồng bộ để cập nhật trạng thái đơn hàng
export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ orderId, status }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.put(
      `/orders/${orderId}/status`,
      { status },
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

// Action để set currentPage và pageSize
export const setCurrentPage = createAsyncThunk('orders/setCurrentPage', async (page) => page);
export const setPageSize = createAsyncThunk('orders/setPageSize', async (size) => size);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    filteredOrders: [],
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
      state.filteredOrders = result;
      state.currentPage = 1; // Reset về trang 1 khi tìm kiếm
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Orders
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.filteredOrders = action.payload; // Ban đầu hiển thị tất cả
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Fetch Orders By Status
    builder
      .addCase(fetchOrdersByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.filteredOrders = action.payload;
      })
      .addCase(fetchOrdersByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Fetch Order Detail
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

    // Update Order Status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        state.orders = state.orders.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order));
        state.filteredOrders = state.filteredOrders.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order));
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Set Pagination
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