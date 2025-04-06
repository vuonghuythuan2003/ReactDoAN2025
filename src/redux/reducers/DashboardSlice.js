// File: src/redux/reducers/DashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
      const newUsersThisMonth = newUsersResponse.data || [];

      const topSpendingResponse = await BASE_URL_ADMIN.get('/reports/top-spending-customers', {
        params: { from, to },
      });
      const topSpendingCustomers = topSpendingResponse.data || [];

      const revenueResponse = await BASE_URL_ADMIN.get('/reports/revenue-by-category');
      const revenueData = revenueResponse.data || [];

      const revenueOverTimeResponse = await BASE_URL_ADMIN.get('/reports/revenue-over-time', {
        params: { from, to },
      });
      const revenueOverTime = revenueOverTimeResponse.data || [];

      const bestSellerResponse = await BASE_URL_ADMIN.get('/reports/best-seller-products', {
        params: { from, to },
      });
      const bestSellerProducts = bestSellerResponse.data || [];

      const invoicesResponse = await BASE_URL_ADMIN.get('/invoices-over-time', {
        params: { from, to },
      });
      const totalInvoices = invoicesResponse.data.totalInvoices || 0;

      const trafficData = [
        { name: 'Organic', value: 44.46, visits: 356 },
        { name: 'Referral', value: 5.54, visits: 36 },
        { name: 'Other', value: 50, visits: 245 },
      ];
      const browserStats = [
        { name: 'Google Chrome', value: 50 },
        { name: 'Mozilla Firefox', value: 30 },
        { name: 'Internet Explorer', value: 10 },
        { name: 'Safari', value: 10 },
      ];

      return {
        totalUsers,
        newUsersThisMonth,
        topSpendingCustomers,
        revenueData,
        revenueOverTime,
        bestSellerProducts,
        totalInvoices,
        trafficData,
        browserStats,
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
    trafficData: [],
    browserStats: [],
    loading: false,
    error: null,
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(), // 1 năm trước
    to: new Date().toISOString(), // Đến ngày hiện tại
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
        state.trafficData = action.payload.trafficData;
        state.browserStats = action.payload.browserStats;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDateRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;