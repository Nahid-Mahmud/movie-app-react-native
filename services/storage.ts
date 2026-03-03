import * as SecureStore from "expo-secure-store";

const COOKIE_KEY = "auth_cookies";

export const storage = {
  // Cookie management
  async saveCookies(cookies: string) {
    try {
      if (__DEV__) {
        console.log("[Storage] Saving cookies:", cookies);
      }
      await SecureStore.setItemAsync(COOKIE_KEY, cookies);
    } catch (error) {
      console.error("Error saving cookies", error);
    }
  },

  async getCookies() {
    try {
      const cookies = await SecureStore.getItemAsync(COOKIE_KEY);
      if (__DEV__ && cookies) {
        console.log("[Storage] Retrieved cookies:", cookies);
      }
      return cookies;
    } catch (error) {
      console.error("Error getting cookies", error);
      return null;
    }
  },

  async removeCookies() {
    try {
      await SecureStore.deleteItemAsync(COOKIE_KEY);
    } catch (error) {
      console.error("Error removing cookies", error);
    }
  },

  // Clear all auth data (for logout)
  async clearAuth() {
    await this.removeCookies();
    await this.removeToken();
  },

  // Legacy token methods (keeping for backward compatibility)
  async saveToken(token: string) {
    try {
      await SecureStore.setItemAsync("auth_token", token);
    } catch (error) {
      console.error("Error saving token", error);
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync("auth_token");
    } catch (error) {
      console.error("Error getting token", error);
      return null;
    }
  },

  async removeToken() {
    try {
      await SecureStore.deleteItemAsync("auth_token");
    } catch (error) {
      console.error("Error removing token", error);
    }
  },
};
