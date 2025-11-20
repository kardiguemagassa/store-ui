// src/features/auth/store/authSlice.ts

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState, LoginCredentials, RegisterData } from '../types/auth.types';
import { authService } from '../services/authService';
import { getErrorMessage } from '../../../shared/types/errors.types';


// ============================================
// TYPES LOCAUX
// ============================================

interface LoginSuccessPayload {
  user: User;
  jwtToken: string;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: AuthState = {
  user: null,
  jwtToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ============================================
// ASYNC THUNKS - VERSION CORRIGÉE
// ============================================

export const loginAsync = createAsyncThunk('auth/login',async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return {
        user: response.user,
        jwtToken: response.jwtToken
      };
    } catch (error: unknown) {
      //getErrorMessage POUR LES MESSAGES DÉTAILLÉS
      const errorMessage = getErrorMessage(error);
      console.log('🔍 Login error details:', error); // Pour debug
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return {
        message: response.message,
        status: response.status
      };
    } catch (error: unknown) {
      // ✅ UTILISER getErrorMessage POUR LES MESSAGES DÉTAILLÉS
      const errorMessage = getErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return { success: true };
    } catch (error: unknown) {
      console.warn('Logout API call failed, continuing local logout:', error);
      return rejectWithValue('Logout failed but local session cleared');
    }
  }
);

// ============================================
// SLICE
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.user = action.payload.user;
      state.jwtToken = action.payload.jwtToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    
    logout: (state) => {
      state.user = null;
      state.jwtToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.jwtToken = action.payload.jwtToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
    
    // REGISTER
    builder
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // LOGOUT
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.jwtToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        console.warn('Logout rejected but session cleared:', action.payload);
        state.user = null;
        state.jwtToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { 
  loginSuccess, 
  logout, 
  clearError, 
  updateUser, 
  setLoading 
} = authSlice.actions;

export default authSlice.reducer;