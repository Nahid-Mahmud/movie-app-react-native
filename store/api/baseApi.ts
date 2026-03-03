import { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import Constants from "expo-constants";
import { storage } from "../../services/storage";

/**
 * In development (Expo Go / dev build on device), "localhost" refers to the
 * device itself, NOT the dev machine. We extract the host IP from Expo's
 * `hostUri` (e.g. "192.168.1.5:8081") and point to port 5000 on that machine.
 *
 * In production, fall back to the env variable.
 */
const getBaseUrl = (): string => {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    const devHost = hostUri?.split(":").shift(); // e.g. "192.168.1.5"
    if (devHost) {
      return `http://${devHost}:5000/api/v1`;
    }
  }
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Log the base URL in dev so you can verify it
if (__DEV__) {
  console.log("[API] baseURL:", axiosInstance.defaults.baseURL);
}

// Inject cookies on every request
axiosInstance.interceptors.request.use(async (config) => {
  const cookies = await storage.getCookies();
  if (cookies) {
    config.headers.Cookie = cookies;

    if (__DEV__) {
      console.log(`[API] Sending request to ${config.url} with cookies:`, cookies);
    }
  } else if (__DEV__) {
    console.log(`[API] No cookies found for request to ${config.url}`);
  }
  return config;
});

// Response interceptor — handle cookies and log errors in dev
axiosInstance.interceptors.response.use(
  async (response) => {
    // Extract cookies from Set-Cookie header
    const setCookie = response.headers["set-cookie"];
    if (setCookie && setCookie.length > 0) {
      // Parse individual cookies and extract name=value pairs
      const cookiePairs = setCookie.map((cookie) => {
        // Extract only the name=value part (before first semicolon)
        return cookie.split(";")[0].trim();
      });

      // Join with semicolon and space (standard Cookie header format)
      const cookieString = cookiePairs.join("; ");
      await storage.saveCookies(cookieString);

      if (__DEV__) {
        console.log("[API] Cookies saved:", cookieString);
        console.log("[API] Individual cookies:", cookiePairs);

        // Log if we received accessToken cookie specifically
        if (cookieString.includes("accessToken=")) {
          console.log("[API] ✅ accessToken cookie received and saved");
        }
      }
    }
    return response;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error("[API Error]", error.config?.url, error.response?.status, JSON.stringify(error.response?.data));
    }
    return Promise.reject(error);
  },
);

export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axiosInstance({ url, method, data, params, headers });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError<any>;
      return {
        error: {
          status: err.response?.status,
          // Normalise: prefer server JSON message, fall back to network error text
          data: err.response?.data ?? { message: err.message },
        },
      };
    }
  };
