import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'teen'>('parent');

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing information', 'Please fill in all fields.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration failed', error.message ?? 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join Driver Analytics</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="John Doe"
          style={styles.input}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          style={styles.input}
        />

        <Text style={styles.label}>Role</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[
              styles.chip,
              role === 'parent' && styles.chipSelected,
            ]}
            onPress={() => setRole('parent')}
          >
            <Text
              style={[
                styles.chipText,
                role === 'parent' && styles.chipTextSelected,
              ]}
            >
              Parent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              role === 'teen' && styles.chipSelected,
            ]}
            onPress={() => setRole('teen')}
          >
            <Text
              style={[
                styles.chipText,
                role === 'teen' && styles.chipTextSelected,
              ]}
            >
              Teen
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign up</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/login">
          <Text style={styles.footerLink}>Sign in</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    backgroundColor: '#020617',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a3a3a3',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: '#e5e5e5',
    marginBottom: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#f9fafb',
    backgroundColor: '#020617',
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingVertical: 8,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#22c55e22',
    borderColor: '#22c55e',
  },
  chipText: {
    color: '#e5e5e5',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#bbf7d0',
  },
  button: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: '#a3a3a3',
  },
  footerLink: {
    color: '#60a5fa',
    fontWeight: '600',
  },
});


