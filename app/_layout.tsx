import { Stack } from "expo-router";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { store } from "../store";
import { setCredentials, setInitialized } from "../store/features/auth/authSlice";
import { storage } from "../services/storage";
import "./global.css";

// Responsible ONLY for hydrating auth state from storage on app start
function AuthHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Check if cookies exist (authentication is cookie-based)
        const cookies = await storage.getCookies();
        if (cookies && cookies.includes("accessToken=")) {
          // We have auth cookies, set authenticated state
          dispatch(setCredentials({ user: {}, token: "cookie_auth" }));
        }
      } catch (e) {
        console.error("Failed to check auth cookies", e);
      } finally {
        dispatch(setInitialized());
      }
    };

    loadAuthState();
  }, [dispatch]);

  return null;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthHydrator />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}
