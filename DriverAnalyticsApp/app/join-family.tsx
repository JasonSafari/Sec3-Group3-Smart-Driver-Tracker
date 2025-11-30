import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { BackHeader } from '@/components/back-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { joinFamily } from '@/services/familyService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from '@/components/toast';
import { getUserFriendlyError, getSuccessMessage } from '@/utils/errorMessages';

export default function JoinFamilyScreen() {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [codeError, setCodeError] = useState('');

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
    setToast({ message, type });
    setShowToast(true);
  };

  const handleJoin = async () => {
    setCodeError('');
    
    if (!inviteCode.trim()) {
      setCodeError('Invite code is required');
      showToastMessage('Please enter an invite code', 'error');
      return;
    }

    if (inviteCode.trim().length !== 6) {
      setCodeError('Invite code must be 6 characters');
      showToastMessage('Invite code must be 6 characters', 'error');
      return;
    }

    if (!token) {
      showToastMessage('Please log in to join a family', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await joinFamily(inviteCode.trim().toUpperCase());
      // Update user data with new family_id
      if (user && result.family) {
        const updatedUser = { ...user, family_id: result.family.family_id };
        setUser(updatedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      // CRITICAL: Replace token if new one provided
      if (result.token) {
        await AsyncStorage.setItem('userToken', result.token);
      }
      // Update user from response if provided
      if (result.user) {
        setUser(result.user);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      }
      // Show success message
      showToastMessage(getSuccessMessage('familyJoin'), 'success');
      // Navigate directly to teen dashboard after short delay
      setTimeout(() => {
        router.replace('/teen-dashboard');
      }, 1000);
    } catch (error: any) {
      const friendlyError = getUserFriendlyError(error);
      showToastMessage(friendlyError, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'teen') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Only teens can join families</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'error'}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
      <BackHeader title="Join Family" showHome />
      <ThemedView style={styles.header}>
        <ThemedText type="title">Join Family</ThemedText>
        <ThemedText>Enter the invite code from your parent</ThemedText>
      </ThemedView>

      <View style={styles.form}>
        <ThemedText style={styles.label}>Invite Code</ThemedText>
        <TextInput
          style={[styles.input, codeError && styles.inputError]}
          value={inviteCode}
          onChangeText={(text) => {
            setInviteCode(text.toUpperCase());
            setCodeError('');
          }}
          placeholder="A1B2C3"
          placeholderTextColor="#6b7280"
          maxLength={6}
          autoCapitalize="characters"
        />
        {codeError ? (
          <ThemedText style={styles.errorText}>{codeError}</ThemedText>
        ) : null}
        <ThemedText style={styles.hint}>
          Enter the 6-character code your parent shared with you
        </ThemedText>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.buttonText}>Join Family</ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: '#e5e5e5',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    color: '#f9fafb',
    backgroundColor: '#1f2937',
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
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

