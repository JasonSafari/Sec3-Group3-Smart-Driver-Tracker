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

export default function RegisterScreen() {
  const router = useRouter();

  const [role, setRole] = useState<"parent" | "teen" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Fake API call (to be replaced with real backend)
  async function registerUser() {
    if (!role) return Alert.alert("Error", "Please select a role.");
    if (!name.trim()) return Alert.alert("Error", "Name is required.");
    if (!email.trim()) return Alert.alert("Error", "Email is required.");
    if (!password.trim() || password.length < 6)
      return Alert.alert("Error", "Password must be at least 6 characters.");

    try {
      // Placeholder: simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert("Success", "Account created successfully!");
      router.replace("/(auth)/login");
    } catch (err) {
      Alert.alert("Registration Failed", "Please try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Role Selection */}
      <Text style={styles.label}>Select Role</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          onPress={() => setRole("parent")}
          style={[
            styles.roleButton,
            role === "parent" && styles.roleSelected,
          ]}
        >
          <Text
            style={[
              styles.roleText,
              role === "parent" && styles.roleTextSelected,
            ]}
          >
            Parent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRole("teen")}
          style={[
            styles.roleButton,
            role === "teen" && styles.roleSelected,
          ]}
        >
          <Text
            style={[
              styles.roleText,
              role === "teen" && styles.roleTextSelected,
            ]}
          >
            Teen
          </Text>
        </TouchableOpacity>
      </View>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="John Doe"
        value={name}
        onChangeText={setName}
      />

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

      {/* Register Button */}
      <TouchableOpacity style={styles.registerBtn} onPress={registerUser}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>

      {/* Link to Login */}
      <Link href="/(auth)/login" style={styles.loginLink}>
        Already have an account? Login
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
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },
  roleSelected: {
    backgroundColor: "#007bff",
  },
  roleText: {
    fontSize: 16,
  },
  roleTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerBtn: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  registerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginLink: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#007bff",
  },
});
