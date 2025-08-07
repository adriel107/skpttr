import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createTrackingLink = createAsyncThunk(
  'tracking/createLink',
  async (linkData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tracking/links', linkData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar link de rastreamento');
    }
  }
);

export const fetchTrackingLinks = createAsyncThunk(
  'tracking/fetchLinks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tracking/links');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar links de rastreamento');
    }
  }
);

export const deleteTrackingLink = createAsyncThunk(
  'tracking/deleteLink',
  async (linkId, { rejectWithValue }) => {
    try {
      await api.delete(`/tracking/links/${linkId}`);
      return linkId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar link de rastreamento');
    }
  }
);

export const toggleLinkStatus = createAsyncThunk(
  'tracking/toggleStatus',
  async (linkId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tracking/links/${linkId}/toggle`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao alterar status do link');
    }
  }
);

const initialState = {
  links: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTrackingLink.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createTrackingLink.fulfilled, (state, action) => {
        state.createLoading = false;
        state.links.unshift(action.payload.data);
      })
      .addCase(createTrackingLink.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      .addCase(fetchTrackingLinks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrackingLinks.fulfilled, (state, action) => {
        state.loading = false;
        state.links = action.payload.data;
      })
      .addCase(fetchTrackingLinks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTrackingLink.fulfilled, (state, action) => {
        state.links = state.links.filter(link => link.id !== action.payload);
      })
      .addCase(toggleLinkStatus.fulfilled, (state, action) => {
        const index = state.links.findIndex(link => link.id === action.payload.data.id);
        if (index !== -1) {
          state.links[index] = action.payload.data;
        }
      });
  },
});

export const { clearError, clearCreateError } = trackingSlice.actions;
export default trackingSlice.reducer; 