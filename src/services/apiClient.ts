import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Production live cloud endpoint on AWS / axiorapulse.com
export const PRODUCTION_API_URL = 'https://axiorapulse.com/api/v1';
export const FALLBACK_API_URL = 'https://api.axiorapulse.com/api/v1';

export const DEFAULT_API_BASE_URL = PRODUCTION_API_URL;

const TOKEN_KEY = 'axiora_pulse_access_token';
const API_URL_KEY = 'axiora_pulse_api_url';

let memoryToken: string | null = null;
let currentBaseUrl: string = DEFAULT_API_BASE_URL;
let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorizedCallback = handler;
};

export const getApiBaseUrl = async (): Promise<string> => {
  try {
    const saved = await SecureStore.getItemAsync(API_URL_KEY);
    if (saved && saved.trim() !== '') {
      currentBaseUrl = saved;
    }
  } catch {
    // fallback
  }
  return currentBaseUrl || PRODUCTION_API_URL;
};

export const setAuthToken = async (token: string | null) => {
  memoryToken = token;
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // fallback
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (memoryToken) return memoryToken;
  try {
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (stored) {
      memoryToken = stored;
      return stored;
    }
  } catch {
    // fallback
  }
  return null;
};

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = await getAuthToken();
  const baseUrl = await getApiBaseUrl();

  let url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (options.params) {
    const query = Object.entries(options.params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (query) {
      url += (url.includes('?') ? '&' : '?') + query;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const timeoutMs = options.timeoutMs || 25000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      // Clear expired or invalid token
      await setAuthToken(null);
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (!response.ok) {
      let errorDetail = `Request failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        errorDetail =
          errJson.detail ||
          errJson.message ||
          (typeof errJson === 'string' ? errJson : errorDetail);
      } catch {
        // Not JSON
      }
      throw new Error(errorDetail);
    }

    // Check if response is empty (e.g. 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Network request timed out. Please check your internet connection.');
    }
    throw error;
  }
}
