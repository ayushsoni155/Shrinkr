import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4001';
const URL_SERVICE = process.env.NEXT_PUBLIC_URL_SERVICE || 'http://localhost:4002';

// ── Auth API ───────────────────────────────────────────────────────
export const authApi = axios.create({ baseURL: AUTH_URL });

// ── URL API ────────────────────────────────────────────────────────
export const urlApi = axios.create({ baseURL: URL_SERVICE });

// Attach JWT to URL API requests
urlApi.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-refresh on 401
urlApi.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const { refreshToken, setTokens, logout } = useAuthStore.getState();
                if (!refreshToken) { logout(); return Promise.reject(error); }

                const { data } = await authApi.post('/api/auth/refresh', { refreshToken });
                setTokens(data.data.accessToken, data.data.refreshToken);
                original.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return urlApi(original);
            } catch {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// ── Auth helpers ───────────────────────────────────────────────────
export const apiSignup = (email: string, password: string) =>
    authApi.post('/api/auth/signup', { email, password });

export const apiVerifyOtp = (email: string, otp: string) =>
    authApi.post('/api/auth/verify-otp', { email, otp });

export const apiLogin = (email: string, password: string) =>
    authApi.post('/api/auth/login', { email, password });

export const apiResendOtp = (email: string) =>
    authApi.post('/api/auth/resend-otp', { email });

// ── URL helpers ────────────────────────────────────────────────────
export const apiCreateUrl = (originalUrl: string, alias?: string) =>
    urlApi.post('/api/urls', { originalUrl, alias });

export const apiGetUrls = (page = 1, limit = 10) =>
    urlApi.get('/api/urls', { params: { page, limit } });

export const apiDeleteUrl = (shortId: string) =>
    urlApi.delete(`/api/urls/${shortId}`);

// ── Analytics (served from URL service) ───────────────────────────
export const apiGetAnalytics = (shortId: string) =>
    urlApi.get(`/api/analytics/${shortId}`);
