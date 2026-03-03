import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../store/features/auth/authApi";
import { setCredentials } from "../../store/features/auth/authSlice";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      const user = result.data.user;

      // Cookies are handled automatically by baseApi interceptors
      // No need to extract token from response body
      dispatch(setCredentials({ user, token: "cookie_auth" }));
      router.replace("/(tabs)" as any);
    } catch (error: any) {
      const message = error?.data?.message || error?.data?.error || error?.message || "Something went wrong";
      Alert.alert("Login Failed", message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MovieFlex Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A8B5DB"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A8B5DB"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register" as any)}>
        <Text style={styles.linkText}>Don&apos;t have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0d23",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1c1b33",
    color: "#fff",
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#2e2c4d",
  },
  button: {
    backgroundColor: "#ef233c",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: "#A8B5DB",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default LoginScreen;
