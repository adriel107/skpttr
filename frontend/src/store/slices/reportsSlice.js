import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboardData = createAsyncThunk(
  'reports/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados do dashboard');
    }
  }
);

export const fetchCampaignReports = createAsyncThunk(
  'reports/fetchCampaigns',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/campaigns');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar relatórios de campanhas');
    }
  }
);

export const fetchSalesData = createAsyncThunk(
  'reports/fetchSales',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/sales');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de vendas');
    }
  }
);

const initialState = {
  dashboardData: null,
  campaignReports: [],
  salesData: [],
  loading: false,
  error: null,
  campaignsLoading: false,
  campaignsError: null,
  salesLoading: false,
  salesError: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.campaignsError = null;
      state.salesError = null;
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
        state.dashboardData = action.payload.data;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCampaignReports.pending, (state) => {
        state.campaignsLoading = true;
        state.campaignsError = null;
      })
      .addCase(fetchCampaignReports.fulfilled, (state, action) => {
        state.campaignsLoading = false;
        state.campaignReports = action.payload.data;
      })
      .addCase(fetchCampaignReports.rejected, (state, action) => {
        state.campaignsLoading = false;
        state.campaignsError = action.payload;
      })
      .addCase(fetchSalesData.pending, (state) => {
        state.salesLoading = true;
        state.salesError = null;
      })
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.salesLoading = false;
        state.salesData = action.payload.data;
      })
      .addCase(fetchSalesData.rejected, (state, action) => {
        state.salesLoading = false;
        state.salesError = action.payload;
      });
  },
});

export const { clearError } = reportsSlice.actions;
export default reportsSlice.reducer; 