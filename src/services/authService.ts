import { apiClient, setAuthToken } from './apiClient';
import {
  AuthResponse,
  LoginRequest,
  OtpVerifyRequest,
  PasswordResetRequest,
  RegisterRequest,
  ResetPasswordConfirmRequest,
  User,
} from '../types';

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.access_token) {
      await setAuthToken(data.access_token);
    }
    return data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.access_token) {
      await setAuthToken(data.access_token);
    }
    return data;
  },

  async verifyOtp(payload: OtpVerifyRequest): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>('/auth/verifyOTP', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        emailOrMobile: payload.email,
        otp: parseInt(payload.otp, 10) || payload.otp,
        flow: payload.flow || 'register',
      }),
    });
    if (data.access_token) {
      await setAuthToken(data.access_token);
    }
    return data;
  },

  async resendOtp(email: string, flow: string = 'register'): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/resendOTP', {
      method: 'POST',
      body: JSON.stringify({
        email,
        emailOrMobile: email,
        flow,
      }),
    });
  },

  async googleLogin(credential: string): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    if (data.access_token) {
      await setAuthToken(data.access_token);
    }
    return data;
  },

  async forgotPassword(payload: PasswordResetRequest): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/forgot-password/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resetPassword(payload: ResetPasswordConfirmRequest): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getProfile(): Promise<User> {
    return apiClient<User>('/profile/me');
  },

  async updateProfile(payload: { full_name?: string; email?: string }): Promise<User> {
    return apiClient<User>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async changePassword(payload: { old_password: string; new_password: string }): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<void> {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    } finally {
      await setAuthToken(null);
    }
  },

  async deleteAccount(confirmation: string = 'DELETE', password?: string, reason?: string): Promise<{ status: string; message: string }> {
    return apiClient<{ status: string; message: string }>('/auth/delete-account', {
      method: 'POST',
      body: JSON.stringify({ confirmation, password, reason }),
    });
  },

  async exportUserData(): Promise<any> {
    return apiClient('/users/me/export-data', {
      method: 'POST',
    });
  },
};
