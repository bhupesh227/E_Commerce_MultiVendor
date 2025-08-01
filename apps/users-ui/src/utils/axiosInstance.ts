import axios from 'axios';
import { runRedirectToLogin } from './redirect';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];


const handleLogout = () => {
    const publicPaths = ['/login', '/signup', '/forgot-password'];
    const currentPath = window.location.pathname;

    if (!publicPaths.includes(currentPath)) {
        runRedirectToLogin();
    }
};


const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};


const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};


axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const is401 = error.response?.status === 401;
        const isRetry = originalRequest._retry;

        if (is401 && !isRetry ) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
                })
            }
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token`,
                    {},
                    { withCredentials: true }
                )

                isRefreshing = false;
                onRefreshSuccess();

                return axiosInstance(originalRequest);
            } catch (error) {
                isRefreshing = false;
                refreshSubscribers = [];
                handleLogout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;