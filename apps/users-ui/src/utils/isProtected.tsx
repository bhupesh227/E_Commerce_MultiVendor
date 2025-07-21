import { CustomAxiosRequestConfig } from "./axiosInstance.types";



export const isProtected: CustomAxiosRequestConfig = {
    requireAuth: true,
}

export const isPublic: CustomAxiosRequestConfig = {
    requireAuth: false,
}