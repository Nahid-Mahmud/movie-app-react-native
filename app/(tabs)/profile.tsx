import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { RootState } from "../../store";
import { logout } from "../../store/features/auth/authSlice";
import { useLogoutMutation } from "../../store/features/auth/authApi";
import { storage } from "../../services/storage";

// Guest view — shown when the user is not logged in
const GuestProfile = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.guestContent}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>

        <Text style={styles.guestTitle}>You&apos;re not logged in</Text>
        <Text style={styles.guestSubtitle}>Sign in to access your profile, save movies, and more.</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/(auth)/login" as any)}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/(auth)/register" as any)}>
          <Text style={styles.secondaryButtonText}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Authenticated view — shown when the user is logged in
const AuthenticatedProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Call logout API to clear server-side cookies
            await logoutMutation(undefined).unwrap();

            // Clear local cookies and auth state
            await storage.clearAuth();
            dispatch(logout());
          } catch (error) {
            // Even if API call fails, clear local state
            await storage.clearAuth();
            dispatch(logout());
            console.error("Logout API failed, but cleared local state:", error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>My Profile</Text>

      <View style={styles.card}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>
        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email || "—"}</Text>
        <Text style={styles.userRole}>{user?.role || "Member"}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Main Profile screen — decides which view to show
const Profile = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return isAuthenticated ? <AuthenticatedProfile /> : <GuestProfile />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0d23",
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
    marginTop: 10,
  },

  // Guest styles
  guestContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 15,
    color: "#A8B5DB",
    textAlign: "center",
    marginBottom: 36,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#ef233c",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#2e2c4d",
  },
  secondaryButtonText: {
    color: "#A8B5DB",
    fontSize: 16,
    fontWeight: "600",
  },

  // Authenticated styles
  card: {
    backgroundColor: "#1c1b33",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2e2c4d",
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2e2c4d",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarIcon: {
    fontSize: 38,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 14,
    color: "#A8B5DB",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: "#ef233c",
    textTransform: "capitalize",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#1c1b33",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ef233c",
  },
  logoutButtonText: {
    color: "#ef233c",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Profile;
