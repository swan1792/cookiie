import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/axiosClient';
import { COOKIE_AUTH, LOCAL_STORAGE_KEYS } from '../../utils/constants';
import { saveState, removeState } from '../../utils/localStorage';

// ─── Async Thunks ────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, recaptchaToken }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password, recaptchaToken });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Even if server call fails, clear local state
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Not authenticated' });
    }
  }
);

// ─── Slice ───────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Login ──
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;

        // Always save user details for protected route pre-check
        saveState(LOCAL_STORAGE_KEYS.loginAdminDetails, action.payload.user);

        // In JWT mode, also store the session token
        if (!COOKIE_AUTH && action.payload.XSessionToken) {
          saveState(LOCAL_STORAGE_KEYS.sessionId, action.payload.XSessionToken);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      })

      // ── Logout ──
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        removeState(LOCAL_STORAGE_KEYS.loginAdminDetails);
        removeState(LOCAL_STORAGE_KEYS.sessionId);
      })

      // ── Fetch Me ──
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        removeState(LOCAL_STORAGE_KEYS.loginAdminDetails);
        removeState(LOCAL_STORAGE_KEYS.sessionId);
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
