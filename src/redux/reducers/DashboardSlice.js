import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { BASE_URL_ADMIN, getToken } from '../../api/index';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async ({ from, to }, { rejectWithValue }) => {
    try {
      const token = getToken();

      const userResponse = await BASE_URL_ADMIN.get('/users', {
        params: { page: 0, size: 1, sortBy: 'createdAt', direction: 'desc' },
      });
      const totalUsers = userResponse.data.totalElements || 0;

      const newUsersResponse = await BASE_URL_ADMIN.get('/new-accounts-this-month');
      const newUsersThisMonth = newUsersResponse.data.map((user) => ({
        key: uuidv4(),
        ...user,
      })) || [];

      const topSpendingResponse = await BASE_URL_ADMIN.get('/reports/top-spending-customers', {
        params: { from, to },
      });
      const topSpendingCustomers = topSpendingResponse.data.map((customer) => ({
        key: uuidv4(),
        ...customer,
      })) || [];

      const revenueResponse = await BASE_URL_ADMIN.get('/reports/revenue-by-category');
      const revenueData = revenueResponse.data.map((item) => ({
        key: uuidv4(),
        ...item,
      })) || [];

      const revenueOverTimeResponse = await BASE_URL_ADMIN.get('/reports/revenue-over-time', {
        params: { from, to },
      });
      const revenueOverTime = revenueOverTimeResponse.data.map((item) => ({
        key: uuidv4(),
        ...item,
      })) || [];

      const bestSellerResponse = await BASE_URL_ADMIN.get('/reports/best-seller-products', {
        params: { from, to },
      });
      const bestSellerProducts = bestSellerResponse.data.map((product) => ({
        key: uuidv4(),
        ...product,
      })) || [];

      const invoicesResponse = await BASE_URL_ADMIN.get('/invoices-over-time', {
        params: { from, to },
      });
      const totalInvoices = invoicesResponse.data.totalInvoices || 0;

      return {
        totalUsers,
        newUsersThisMonth,
        topSpendingCustomers,
        revenueData,
        revenueOverTime,
        bestSellerProducts,
        totalInvoices,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể lấy dữ liệu dashboard!');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    totalUsers: 0,
    newUsersThisMonth: [],
    topSpendingCustomers: [],
    revenueData: [],
    revenueOverTime: [],
    bestSellerProducts: [],
    totalInvoices: 0,
    loading: false,
    error: null,
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
    to: new Date().toISOString(),
  },
  reducers: {
    setDateRange: (state, action) => {
      state.from = action.payload.from;
      state.to = action.payload.to;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.totalUsers = action.payload.totalUsers;
        state.newUsersThisMonth = action.payload.newUsersThisMonth;
        state.topSpendingCustomers = action.payload.topSpendingCustomers;
        state.revenueData = action.payload.revenueData;
        state.revenueOverTime = action.payload.revenueOverTime;
        state.bestSellerProducts = action.payload.bestSellerProducts;
        state.totalInvoices = action.payload.totalInvoices;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDateRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;