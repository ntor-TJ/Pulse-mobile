import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken, setAuthToken, setUnauthorizedHandler } from '../services/apiClient';
import { authService } from '../services/authService';
import { biometricService } from '../services/biometricService';
import { LoginRequest, OtpVerifyRequest, RegisterRequest, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  verifyOtp: (payload: OtpVerifyRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  biometricLogin: () => Promise<boolean>;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  verifyOtp: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  biometricLogin: async () => false,
  isBiometricAvailable: false,
  isBiometricEnabled: false,
  setBiometricEnabled: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    // Register global 401 unauth handler
    setUnauthorizedHandler(() => {
      setUser(null);
      setTokenState(null);
    });

    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const storedToken = await getAuthToken();
      if (storedToken) {
        setTokenState(storedToken);
        const profile = await authService.getProfile();
        setUser(profile);
      }

      const bioAvail = await biometricService.isAvailable();
      const bioEn = await biometricService.isEnabled();
      setIsBiometricAvailable(bioAvail);
      setIsBiometricEnabled(bioEn);
    } catch {
      await setAuthToken(null);
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (payload: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(payload);
      setTokenState(response.access_token);
      setUser(response.user);

      if (isBiometricEnabled) {
        await biometricService.setEnabled(true, payload);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(payload);
      if (response.access_token) {
        setTokenState(response.access_token);
        setUser(response.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (payload: OtpVerifyRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(payload);
      setTokenState(response.access_token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const biometricLogin = async (): Promise<boolean> => {
    try {
      const creds = await biometricService.authenticateAndGetCredentials();
      if (creds) {
        await login(creds);
        return true;
      }
    } catch {
      // Biometric auth failed or cancelled
    }
    return false;
  };

  const setBiometricEnabledHandler = async (enabled: boolean) => {
    await biometricService.setEnabled(enabled);
    setIsBiometricEnabled(enabled);
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      // Profile fetch failed
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        verifyOtp,
        logout,
        refreshProfile,
        biometricLogin,
        isBiometricAvailable,
        isBiometricEnabled,
        setBiometricEnabled: setBiometricEnabledHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
