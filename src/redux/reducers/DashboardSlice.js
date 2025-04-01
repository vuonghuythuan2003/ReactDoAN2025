import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDashboardData = createAsyncThunk('dashboard/fetchDashboardData', async ({ from, to }, { rejectWithValue }) => {
  try {
    // Fetch total users
    const userResponse = await axios.get('http://localhost:8080/api/v1/admin/users', {
      params: { page: 0, size: 1, sortBy: 'createdAt', direction: 'desc' },
    });
    const totalUsers = userResponse.data.totalElements || 0;

    // Fetch new users this month
    const newUsersResponse = await axios.get('http://localhost:8080/api/v1/admin/new-accounts-this-month');
    const newUsersThisMonth = newUsersResponse.data || [];

    // Fetch top spending customers
    const topSpendingResponse = await axios.get('http://localhost:8080/api/v1/admin/reports/top-spending-customers', {
      params: { from, to },
    });
    const topSpendingCustomers = topSpendingResponse.data || [];

    // Fetch revenue by category
    const revenueResponse = await axios.get('http://localhost:8080/api/v1/admin/reports/revenue-by-category');
    const revenueData = revenueResponse.data || [];

    // Mock data for traffic and browser stats
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
      trafficData,
      browserStats,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Không thể lấy dữ liệu dashboard!');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    totalUsers: 0,
    newUsersThisMonth: [],
    topSpendingCustomers: [],
    trafficData: [],
    browserStats: [],
    revenueData: [],
    loading: false,
    error: null,
    from: new Date('2025-02-01T00:00:00').toISOString(),
    to: new Date('2025-02-27T23:59:59').toISOString(),
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
        state.trafficData = action.payload.trafficData;
        state.browserStats = action.payload.browserStats;
        state.revenueData = action.payload.revenueData;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDateRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;