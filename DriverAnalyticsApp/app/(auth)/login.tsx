import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Fake API login to be replaced with real backend
  async function handleLogin() {
    if (!email.trim()) return Alert.alert("Error", "Email is required.");
    if (!password.trim())
      return Alert.alert("Error", "Password is required.");

    try {
      // Fake delay for API request
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Temporarily simulate user roles based on email
      let role: "parent" | "teen" = "teen";

      if (email.toLowerCase().includes("parent")) role = "parent";
      if (email.toLowerCase().includes("teen")) role = "teen";

      Alert.alert("Success", "Logged in!");

      // Redirect based on role
      if (role === "parent") {
        router.replace("/(parent)");
      } else {
        router.replace("/(teen)");
      }
    } catch (err) {
      Alert.alert("Login Failed", "Invalid credentials.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="example@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="******"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      {/* Link to Register */}
      <Link href="/(auth)/register" style={styles.registerLink}>
        Don't have an account? Register
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginTop: 5,
  },
  loginBtn: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  registerLink: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#007bff",
  },
});

