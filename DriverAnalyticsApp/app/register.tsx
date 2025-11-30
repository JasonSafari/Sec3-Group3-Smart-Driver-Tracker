import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import { Toast } from '@/components/toast';
import { getUserFriendlyError, getSuccessMessage } from '@/utils/errorMessages';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'teen'>('parent');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
    setToast({ message, type });
    setShowToast(true);
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToastMessage('Please fill in all fields correctly', 'error');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      showToastMessage(getSuccessMessage('register'), 'success');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } catch (error: any) {
      const friendlyError = getUserFriendlyError(error);
      showToastMessage(friendlyError, 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'error'}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
      
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join Driver Analytics</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrors({ ...errors, name: undefined });
          }}
          placeholder="John Doe"
          placeholderTextColor="#6b7280"
          style={[styles.input, errors.name && styles.inputError]}
        />
        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors({ ...errors, email: undefined });
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#6b7280"
          style={[styles.input, errors.email && styles.inputError]}
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors({ ...errors, password: undefined });
          }}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#6b7280"
          style={[styles.input, errors.password && styles.inputError]}
        />
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

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
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
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


