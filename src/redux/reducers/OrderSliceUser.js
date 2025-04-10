import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL_USER } from '../../api/index';

// Lấy lịch sử mua hàng của người dùng
export const fetchUserOrderHistory = createAsyncThunk(
    'userOrders/fetchUserOrderHistory',
    async (userId, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            console.log('Sending request to /history/getAll with userId:', userId);
            const response = await BASE_URL_USER.get(`/history/getAll?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Response from /history/getAll:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching user order history:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Lấy chi tiết đơn hàng theo serialNumber
export const fetchOrderDetails = createAsyncThunk(
    'userOrders/fetchOrderDetails',
    async (serialNumber, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            const response = await BASE_URL_USER.get(`/history?serialNumber=${serialNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Lấy danh sách đơn hàng theo trạng thái
export const fetchOrdersByStatus = createAsyncThunk(
    'userOrders/fetchOrdersByStatus',
    async ({ status, userId }, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            const response = await BASE_URL_USER.get(`/history/${status}?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching orders by status:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Hủy đơn hàng
export const cancelOrder = createAsyncThunk(
    'userOrders/cancelOrder',
    async (orderId, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            const response = await BASE_URL_USER.put(`/history/${orderId}/cancel`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return { orderId, message: response.data };
        } catch (error) {
            console.error('Error canceling order:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const orderSliceUser = createSlice({
    name: 'userOrders',
    initialState: {
        orderHistory: [],
        orderDetails: null,
        loading: false,
        error: null,
        hasFetchedHistory: false,
        hasFetchedDetails: false,
    },
    reducers: {
        resetUserOrders: (state) => {
            state.orderHistory = [];
            state.orderDetails = null;
            state.loading = false;
            state.error = null;
            state.hasFetchedHistory = false;
            state.hasFetchedDetails = false;
        },
        clearOrderDetails: (state) => {
            state.orderDetails = null;
            state.hasFetchedDetails = false;
        },
        resetFetchStatus: (state) => {
            state.hasFetchedHistory = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserOrderHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserOrderHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.orderHistory = action.payload;
                state.hasFetchedHistory = true;
            })
            .addCase(fetchUserOrderHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(fetchOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.orderDetails = action.payload;
                state.hasFetchedDetails = true;
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(fetchOrdersByStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.orderHistory = action.payload;
                state.hasFetchedHistory = true;
            })
            .addCase(fetchOrdersByStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                const { orderId } = action.payload;
                const order = state.orderHistory.find((o) => o.orderId === orderId);
                if (order) {
                    order.status = 'CANCEL';
                }
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetUserOrders, clearOrderDetails, resetFetchStatus } = orderSliceUser.actions;
export default orderSliceUser.reducer;